/**
 * Veri Kalitesi Queries
 * Excel yükleme geçmişi, değişiklik logu ve veri doğrulama sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const veriKalitesiQueries = {
  /**
   * Excel Yükleme Geçmişi
   * veri_yukleme_gecmisi tablosundan yükleme geçmişini getirir
   */
  async getExcelYuklemeGecmisi(limit = 50) {
    const { data, error } = await supabaseAdmin
      .from('veri_yukleme_gecmisi')
      .select(`
        *,
        kullanicilar!inner(kullanici_id, ad, soyad, email)
      `)
      .order('yukleme_tarihi', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Değişiklik Logu
   * veri_degisiklik_logu tablosundan değişiklik geçmişini getirir
   */
  async getDegisiklikLogu(tabloAdi = null, kayitId = null, limit = 100) {
    let query = supabaseAdmin
      .from('veri_degisiklik_logu')
      .select(`
        *,
        kullanicilar!inner(kullanici_id, ad, soyad, email)
      `)
      .order('degisiklik_tarihi', { ascending: false })
      .limit(limit);

    if (tabloAdi) {
      query = query.eq('tablo_adi', tabloAdi);
    }
    if (kayitId) {
      query = query.eq('kayit_id', kayitId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Yükleme İstatistikleri
   * Excel yükleme başarı/başarısızlık oranları
   */
  async getYuklemeIstatistikleri(baslangicTarihi = null, bitisTarihi = null) {
    let query = supabaseAdmin
      .from('veri_yukleme_gecmisi')
      .select('yukleme_durumu, basarili_satir_sayisi, hatali_satir_sayisi, yuklenen_satir_sayisi');

    if (baslangicTarihi) {
      query = query.gte('yukleme_tarihi', baslangicTarihi);
    }
    if (bitisTarihi) {
      query = query.lte('yukleme_tarihi', bitisTarihi);
    }

    const { data, error } = await query;
    if (error) throw error;

    // İstatistikleri hesapla
    const toplamYukleme = data.length;
    const basariliYukleme = data.filter(d => d.yukleme_durumu === 'Basarili').length;
    const kismiBasarili = data.filter(d => d.yukleme_durumu === 'Kismi_Basarili').length;
    const basarisizYukleme = data.filter(d => d.yukleme_durumu === 'Basarisiz').length;
    
    const toplamSatir = data.reduce((sum, d) => sum + (d.yuklenen_satir_sayisi || 0), 0);
    const basariliSatir = data.reduce((sum, d) => sum + (d.basarili_satir_sayisi || 0), 0);
    const hataliSatir = data.reduce((sum, d) => sum + (d.hatali_satir_sayisi || 0), 0);

    return {
      toplam_yukleme: toplamYukleme,
      basarili_yukleme: basariliYukleme,
      kismi_basarili: kismiBasarili,
      basarisiz_yukleme: basarisizYukleme,
      basari_orani: toplamYukleme > 0 ? (basariliYukleme / toplamYukleme) * 100 : 0,
      toplam_satir: toplamSatir,
      basarili_satir: basariliSatir,
      hatali_satir: hataliSatir,
      satir_basari_orani: toplamSatir > 0 ? (basariliSatir / toplamSatir) * 100 : 0
    };
  },

  /**
   * Değişiklik İstatistikleri
   * Tablo ve kullanıcı bazlı değişiklik istatistikleri
   */
  async getDegisiklikIstatistikleri(baslangicTarihi = null, bitisTarihi = null) {
    let query = supabaseAdmin
      .from('veri_degisiklik_logu')
      .select('tablo_adi, degisiklik_turu, degistiren_kullanici_id');

    if (baslangicTarihi) {
      query = query.gte('degisiklik_tarihi', baslangicTarihi);
    }
    if (bitisTarihi) {
      query = query.lte('degisiklik_tarihi', bitisTarihi);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Tablo bazlı istatistikler
    const tabloMap = {};
    data.forEach(item => {
      const tablo = item.tablo_adi || 'Bilinmeyen';
      if (!tabloMap[tablo]) {
        tabloMap[tablo] = { insert: 0, update: 0, delete: 0 };
      }
      if (item.degisiklik_turu === 'INSERT') tabloMap[tablo].insert++;
      if (item.degisiklik_turu === 'UPDATE') tabloMap[tablo].update++;
      if (item.degisiklik_turu === 'DELETE') tabloMap[tablo].delete++;
    });

    // Kullanıcı bazlı istatistikler
    const kullaniciMap = {};
    data.forEach(item => {
      const kullaniciId = item.degistiren_kullanici_id || 'Bilinmeyen';
      if (!kullaniciMap[kullaniciId]) {
        kullaniciMap[kullaniciId] = 0;
      }
      kullaniciMap[kullaniciId]++;
    });

    return {
      toplam_degisiklik: data.length,
      tablo_bazli: Object.entries(tabloMap).map(([tablo, stats]) => ({
        tablo_adi: tablo,
        toplam: stats.insert + stats.update + stats.delete,
        insert: stats.insert,
        update: stats.update,
        delete: stats.delete
      })),
      kullanici_bazli: Object.entries(kullaniciMap).map(([kullaniciId, count]) => ({
        kullanici_id: kullaniciId,
        degisiklik_sayisi: count
      })).sort((a, b) => b.degisiklik_sayisi - a.degisiklik_sayisi)
    };
  },

  /**
   * Veri Doğrulama Kontrolü
   * Geçersiz ve eksik veri tespiti
   */
  async getVeriDogrulamaKontrolu() {
    const kontroller = [];

    // TC Kimlik No kontrolü (11 haneli olmalı)
    const { data: tcKontrol, error: tcError } = await supabaseAdmin
      .from('ogrenci')
      .select('ogrenci_id, tc_kimlik_no')
      .not('tc_kimlik_no', 'is', null)
      .neq('soft_delete', true);

    if (!tcError && tcKontrol) {
      const gecersizTc = tcKontrol.filter(o => {
        const tc = o.tc_kimlik_no;
        return !tc || tc.length !== 11 || !/^\d+$/.test(tc);
      });
      if (gecersizTc.length > 0) {
        kontroller.push({
          kategori: 'TC Kimlik No',
          sorun: 'Geçersiz format',
          sayi: gecersizTc.length,
          detay: gecersizTc.map(o => o.ogrenci_id)
        });
      }
    }

    // Email formatı kontrolü
    const { data: emailData, error: emailError } = await supabaseAdmin
      .from('ogrenci')
      .select('ogrenci_id, email')
      .not('email', 'is', null)
      .neq('soft_delete', true);

    if (!emailError && emailData) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      const gecersizEmail = emailData.filter(o => {
        const email = o.email;
        return !email || !emailRegex.test(email);
      });
      if (gecersizEmail.length > 0) {
        kontroller.push({
          kategori: 'Email',
          sorun: 'Geçersiz format',
          sayi: gecersizEmail.length,
          detay: gecersizEmail.map(o => o.ogrenci_id)
        });
      }
    }

    // Eksik danışman ataması
    const { count: eksikDanisman, error: danismanError } = await supabaseAdmin
      .from('ogrenci')
      .select('ogrenci_id', { count: 'exact', head: true })
      .is('danisman_id', null)
      .eq('soft_delete', false);

    if (!danismanError && eksikDanisman > 0) {
      kontroller.push({
        kategori: 'Danışman Ataması',
        sorun: 'Eksik danışman ataması',
        sayi: eksikDanisman,
        detay: []
      });
    }

    return {
      toplam_sorun: kontroller.reduce((sum, k) => sum + k.sayi, 0),
      kontroller: kontroller
    };
  }
};

