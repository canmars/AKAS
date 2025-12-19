/**
 * Öğrenci Model
 * Öğrenci iş mantığı ve validasyon
 * KDS kurallarına göre ders aşaması kontrolü ve risk hesaplama
 */

import { supabaseAdmin } from '../db/connection.js';

export class OgrenciModel {
  /**
   * Öğrenci veri validasyonu
   */
  static validate(data) {
    const errors = [];

    if (!data.program_turu_id) {
      errors.push('Program türü zorunludur');
    }

    if (!data.durum_id) {
      errors.push('Durum zorunludur');
    }

    if (!data.kayit_tarihi) {
      errors.push('Kayıt tarihi zorunludur');
    }

    if (!data.ad || !data.soyad) {
      errors.push('Ad ve soyad zorunludur');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Ders Aşaması Kontrolü
   * Öğrencinin ders aşamasını bitirip bitirmediğini kontrol eder
   * Kural: (Ders Sayısı >= 7) AND (AKTS >= 60) AND (Seminer == 'B' veya 'AA'-'DD' arası)
   * SQL tarafındaki fn_kontrol_ders_asamasi fonksiyonunu çağırır
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<Object>} Ders aşaması kontrol sonucu
   */
  static async kontrolDersAsamasi(ogrenciId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('fn_kontrol_ders_asamasi', {
        p_ogrenci_id: ogrenciId
      });

      if (error) {
        throw new Error(`Ders aşaması kontrolü yapılamadı: ${error.message}`);
      }

      // RPC fonksiyonu tek bir satır döndürdüğü için ilk elemanı alıyoruz
      const result = data[0];

      return {
        dersAsamasiTamamlandi: result.ders_asamasi_tamamlandi,
        dersSayisi: result.ders_sayisi,
        toplamAKTS: result.toplam_akts,
        seminerBasarili: result.seminer_basarili,
        seminerDersKodu: result.seminer_ders_kodu,
        seminerNotKodu: result.seminer_not_kodu,
        kriterler: {
          dersSayisiKriteri: result.ders_sayisi >= 7,
          aktsKriteri: result.toplam_akts >= 60,
          seminerKriteri: result.seminer_basarili
        }
      };
    } catch (error) {
      throw new Error(`Ders aşaması kontrolü hatası: ${error.message}`);
    }
  }

  /**
   * Öğrenci risk skorunu hesapla (KDS fonksiyonu)
   * SQL tarafındaki fn_hesapla_ogrenci_riski fonksiyonunu çağırır
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<number>} Risk skoru (0-100 arası)
   */
  static async hesaplaRiskSkoru(ogrenciId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('fn_hesapla_ogrenci_riski', {
        p_ogrenci_id: ogrenciId
      });

      if (error) {
        throw new Error(`Risk skoru hesaplanamadı: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      throw new Error(`Risk skoru hesaplama hatası: ${error.message}`);
    }
  }

  /**
   * Etkili yarıyıl hesapla (H notları düşüldükten sonra)
   * SQL tarafındaki fn_hesapla_etkili_yariyil fonksiyonunu çağırır
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<number>} Etkili yarıyıl sayısı
   */
  static async hesaplaEtkiliYariyil(ogrenciId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('fn_hesapla_etkili_yariyil', {
        p_ogrenci_id: ogrenciId
      });

      if (error) {
        throw new Error(`Etkili yarıyıl hesaplanamadı: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      throw new Error(`Etkili yarıyıl hesaplama hatası: ${error.message}`);
    }
  }

  /**
   * Öğrencinin H (Hak Dondurma) notu sayısını getir
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<number>} H notu sayısı
   */
  static async getHNotuSayisi(ogrenciId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('ogrenci_dersleri')
        .select('yariyil')
        .eq('ogrenci_id', ogrenciId)
        .eq('not_kodu', 'H');

      if (error) {
        throw new Error(`H notu bilgisi alınamadı: ${error.message}`);
      }

      // Farklı yarıyıllardaki H notlarını say
      const farkliYariyillar = new Set(data.map(d => d.yariyil));
      return farkliYariyillar.size;
    } catch (error) {
      throw new Error(`H notu sayısı hesaplama hatası: ${error.message}`);
    }
  }
}

