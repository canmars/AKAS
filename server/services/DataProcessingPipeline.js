/**
 * Data Processing Pipeline
 * Excel veri yükleme, validasyon ve temizleme işlemleri
 */

import XLSX from 'xlsx';
import { supabaseAdmin } from '../db/connection.js';

export class DataProcessingPipeline {
  /**
   * Excel dosyasını parse et ve JSON array'e dönüştür
   * @param {Buffer} fileBuffer - Excel dosyası buffer'ı
   * @returns {Array} Satır array'i
   */
  parseExcelFile(fileBuffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // İlk sheet'i al
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // raw: false -> string olarak al
      
      return data;
    } catch (error) {
      throw new Error(`Excel dosyası parse edilemedi: ${error.message}`);
    }
  }

  /**
   * Excel satırını validate et (SQL fonksiyonunu çağır)
   * @param {Object} rowData - Excel satırı (JSON)
   * @returns {Promise<Object>} Validation sonucu
   */
  async validateExcelRow(rowData) {
    try {
      const { data, error } = await supabaseAdmin.rpc('validate_excel_row', {
        p_row_data: rowData
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Validation hatası:', error);
      return {
        gecerli: false,
        hatalar: [error.message],
        hata_sayisi: 1
      };
    }
  }

  /**
   * Excel verisini temizle (SQL fonksiyonunu çağır)
   * @param {Object} rawData - Ham Excel verisi
   * @returns {Promise<Object>} Temizlenmiş veri
   */
  async cleanseExcelData(rawData) {
    try {
      const { data, error } = await supabaseAdmin.rpc('cleanse_excel_data', {
        p_raw_data: rawData
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Cleansing hatası:', error);
      return rawData; // Hata durumunda ham veriyi döndür
    }
  }

  /**
   * Excel veri yükleme işlemini gerçekleştir
   * @param {Buffer} fileBuffer - Excel dosyası buffer'ı
   * @param {string} fileName - Dosya adı
   * @param {string} kullaniciId - Yükleyen kullanıcı ID
   * @returns {Promise<Object>} Yükleme sonucu
   */
  async processExcelUpload(fileBuffer, fileName, kullaniciId) {
    const startTime = Date.now();
    const hataDetaylari = [];
    let basariliSatirSayisi = 0;
    let hataliSatirSayisi = 0;

    try {
      // 1. Excel dosyasını parse et
      const rawRows = this.parseExcelFile(fileBuffer);
      const toplamSatirSayisi = rawRows.length;

      if (toplamSatirSayisi === 0) {
        throw new Error('Excel dosyası boş veya geçersiz format');
      }

      // 2. Her satırı işle
      const cleanedRows = [];
      
      for (let i = 0; i < rawRows.length; i++) {
        const rawRow = rawRows[i];
        const satirNumarasi = i + 2; // Excel'de 1. satır header, 2. satırdan başlar

        try {
          // 2.1. Veriyi temizle
          const cleanedRow = await this.cleanseExcelData(rawRow);
          
          // 2.2. Validate et
          const validationResult = await this.validateExcelRow(cleanedRow);

          if (validationResult.gecerli) {
            // Validasyon başarılı, veritabanına ekle
            cleanedRows.push(cleanedRow);
            basariliSatirSayisi++;
          } else {
            // Validasyon hatası
            hataliSatirSayisi++;
            hataDetaylari.push({
              satir: satirNumarasi,
              hatalar: validationResult.hatalar,
              veri: cleanedRow
            });
          }
        } catch (error) {
          hataliSatirSayisi++;
          hataDetaylari.push({
            satir: satirNumarasi,
            hatalar: [error.message],
            veri: rawRow
          });
        }
      }

      // 3. Batch insert (transaction içinde)
      if (cleanedRows.length > 0) {
        await this.batchInsertOgrenci(cleanedRows);
      }

      // 4. Risk skorlarını tetikle (batch)
      if (basariliSatirSayisi > 0) {
        // Risk skoru hesaplama fonksiyonunu çağır (async, arka planda çalışabilir)
        this.triggerRiskScoreCalculation().catch(err => {
          console.error('Risk skoru hesaplama hatası:', err);
        });
      }

      // 5. Yükleme geçmişini kaydet
      const islemSuresi = (Date.now() - startTime) / 1000; // saniye
      const yuklemeDurumu = hataliSatirSayisi === 0 ? 'Basarili' :
                           basariliSatirSayisi > 0 ? 'Kismi_Basarili' : 'Basarisiz';

      const { data: yuklemeId, error: logError } = await supabaseAdmin.rpc('kaydet_yukleme_gecmisi', {
        p_dosya_adi: fileName,
        p_dosya_boyutu_kb: Math.round(fileBuffer.length / 1024),
        p_yuklenen_satir_sayisi: toplamSatirSayisi,
        p_basarili_satir_sayisi: basariliSatirSayisi,
        p_hatali_satir_sayisi: hataliSatirSayisi,
        p_hata_detaylari: hataDetaylari,
        p_yukleyen_kullanici_id: kullaniciId,
        p_yukleme_durumu: yuklemeDurumu,
        p_islem_suresi_saniye: islemSuresi
      });

      if (logError) {
        console.error('Yükleme geçmişi kaydedilemedi:', logError);
      }

      // 6. Sonuç döndür
      return {
        success: basariliSatirSayisi > 0,
        yuklemeId: yuklemeId,
        toplamSatirSayisi,
        basariliSatirSayisi,
        hataliSatirSayisi,
        hataDetaylari,
        yuklemeDurumu,
        islemSuresi
      };

    } catch (error) {
      console.error('Excel yükleme hatası:', error);
      
      // Hata durumunda da log kaydet
      const islemSuresi = (Date.now() - startTime) / 1000;
      await supabaseAdmin.rpc('kaydet_yukleme_gecmisi', {
        p_dosya_adi: fileName,
        p_dosya_boyutu_kb: Math.round(fileBuffer.length / 1024),
        p_yuklenen_satir_sayisi: 0,
        p_basarili_satir_sayisi: 0,
        p_hatali_satir_sayisi: 0,
        p_hata_detaylari: [{ hata: error.message }],
        p_yukleyen_kullanici_id: kullaniciId,
        p_yukleme_durumu: 'Basarisiz',
        p_islem_suresi_saniye: islemSuresi
      }).catch(err => console.error('Hata log kaydedilemedi:', err));

      throw error;
    }
  }

  /**
   * Öğrenci verilerini batch olarak ekle
   * @param {Array} cleanedRows - Temizlenmiş satırlar
   */
  async batchInsertOgrenci(cleanedRows) {
    try {
      // Öğrenci verilerini hazırla
      const ogrenciData = cleanedRows.map(row => ({
        ad: row.ad,
        soyad: row.soyad,
        tc_kimlik_no: row.tc_kimlik_no || null,
        email: row.email || null,
        telefon: row.telefon || null,
        dogum_tarihi: row.dogum_tarihi || null,
        cinsiyet: row.cinsiyet || null,
        adres: row.adres || null,
        kayit_tarihi: row.kayit_tarihi,
        kabul_tarihi: row.kabul_tarihi || null,
        ogrenci_no: row.ogrenci_no || null,
        program_turu_id: row.program_turu_id,
        durum_id: row.durum_id,
        danisman_id: row.danisman_id || null,
        program_kabul_turu: row.program_kabul_turu || null
      }));

      // Batch insert (Supabase 1000 satır limiti var, chunk'lara böl)
      const chunkSize = 500;
      for (let i = 0; i < ogrenciData.length; i += chunkSize) {
        const chunk = ogrenciData.slice(i, i + chunkSize);
        const { error } = await supabaseAdmin
          .from('ogrenci')
          .insert(chunk);

        if (error) {
          throw new Error(`Batch insert hatası (satır ${i + 1}-${i + chunk.length}): ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Batch insert hatası:', error);
      throw error;
    }
  }

  /**
   * Risk skoru hesaplama fonksiyonunu tetikle
   */
  async triggerRiskScoreCalculation() {
    try {
      // Tüm aktif öğrenciler için risk skoru hesapla
      // batch_calculate_risk_skoru fonksiyonu TABLE döndürüyor, bu yüzden data'yı alıyoruz
      const { data, error } = await supabaseAdmin.rpc('batch_calculate_risk_skoru');

      if (error) {
        console.error('Risk skoru hesaplama hatası:', error);
      } else {
        console.log(`Risk skoru hesaplandı: ${data?.length || 0} öğrenci`);
      }
    } catch (error) {
      console.error('Risk skoru tetikleme hatası:', error);
    }
  }

  /**
   * Yükleme geçmişini getir
   * @param {string} kullaniciId - Kullanıcı ID (opsiyonel)
   * @param {number} limit - Limit
   * @returns {Promise<Array>} Yükleme geçmişi
   */
  async getUploadHistory(kullaniciId = null, limit = 20) {
    try {
      let query = supabaseAdmin
        .from('veri_yukleme_gecmisi')
        .select('*')
        .order('yukleme_tarihi', { ascending: false })
        .limit(limit);

      if (kullaniciId) {
        query = query.eq('yukleyen_kullanici_id', kullaniciId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Yükleme geçmişi alınamadı:', error);
      throw error;
    }
  }
}

