/**
 * Dashboard Queries
 * Dashboard için özel SQL sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const dashboardQueries = {
  /**
   * KPI metrikleri
   */
  async getKPIMetrics() {
    // Normalizasyon: ogrenci_mevcut_durum_view kullanılıyor
    const { data: viewData, error: viewError } = await supabaseAdmin
      .from('ogrenci_mevcut_durum_view')
      .select('ogrenci_id, mevcut_risk_skoru, son_login');

    if (viewError) throw viewError;

    // Aktif öğrenci sayısı (ogrenci tablosundan)
    const { data: ogrenciData, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('ogrenci_id, durum_id, durum_turleri!inner(durum_kodu)')
      .eq('soft_delete', false)
      .eq('durum_turleri.durum_kodu', 'Aktif');

    if (ogrenciError) throw ogrenciError;

    const aktifOgrenciSayisi = ogrenciData.length;
    const kritikRiskSayisi = viewData.filter(o => o.mevcut_risk_skoru >= 70).length;

    // TİK toplantıları (1 ay içinde)
    const birAySonra = new Date();
    birAySonra.setMonth(birAySonra.getMonth() + 1);
    
    const { data: tikData, error: tikError } = await supabaseAdmin
      .from('tik_toplantilari')
      .select('toplanti_id')
      .gte('toplanti_tarihi', new Date().toISOString().split('T')[0])
      .lte('toplanti_tarihi', birAySonra.toISOString().split('T')[0]);

    const yaklasanTikSayisi = tikError ? 0 : tikData.length;

    // Hayalet öğrenciler (180 gün login yok) - ogrenci.son_login veya ogrenci_son_login tablosundan
    const yuzSeksenGunOnce = new Date();
    yuzSeksenGunOnce.setDate(yuzSeksenGunOnce.getDate() - 180);
    
    const hayaletOgrenciSayisi = viewData.filter(o => {
      if (!o.son_login) return true;
      return new Date(o.son_login) < yuzSeksenGunOnce;
    }).length;

    return {
      toplamOgrenci: aktifOgrenciSayisi,
      kritikRisk: kritikRiskSayisi,
      yaklasanTik: yaklasanTikSayisi,
      hayaletOgrenci: hayaletOgrenciSayisi
    };
  },

  /**
   * Risk skoru dağılımı
   */
  async getRiskDagilimi() {
    // Normalizasyon: ogrenci_risk_ozet_view kullanılıyor
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_ozet_view')
      .select('risk_skoru')
      .not('risk_skoru', 'is', null);

    if (error) throw error;

    const dagilim = {
      dusuk: 0,    // 0-30
      orta: 0,     // 31-50
      yuksek: 0,   // 51-70
      kritik: 0    // 71-100
    };

    data.forEach(o => {
      const skor = o.risk_skoru;
      if (skor <= 30) dagilim.dusuk++;
      else if (skor <= 50) dagilim.orta++;
      else if (skor <= 70) dagilim.yuksek++;
      else dagilim.kritik++;
    });

    return dagilim;
  },

  /**
   * Program bazında dağılım
   */
  async getProgramDagilimi() {
    const { data, error } = await supabaseAdmin
      .from('ogrenci')
      .select(`
        program_turu_id,
        program_turleri!inner(program_adi, program_kodu)
      `)
      .eq('soft_delete', false);

    if (error) throw error;

    const dagilim = {};
    data.forEach(o => {
      const programAdi = o.program_turleri.program_adi;
      dagilim[programAdi] = (dagilim[programAdi] || 0) + 1;
    });

    return dagilim;
  },

  /**
   * Kritik risk altındaki öğrenciler
   */
  async getKritikOgrenciler(limit = 10) {
    // Normalizasyon: ogrenci_risk_ozet_view kullanılıyor
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_ozet_view')
      .select(`
        ogrenci_id,
        risk_skoru,
        risk_seviyesi,
        program_adi,
        durum_adi
      `)
      .gte('risk_skoru', 70)
      .order('risk_skoru', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  },

  /**
   * Danışman yük dağılımı
   */
  async getDanismanYuk() {
    // Normalizasyon: akademik_personel_yuk_view kullanılıyor
    const { data, error } = await supabaseAdmin
      .from('akademik_personel_yuk_view')
      .select(`
        personel_id,
        ad,
        soyad,
        unvan,
        maksimum_kapasite,
        mevcut_yuk,
        kalan_kapasite
      `)
      .order('mevcut_yuk', { ascending: false });

    if (error) throw error;

    return data.map(p => ({
      ...p,
      kapasiteKullanimYuzdesi: (p.mevcut_yuk / p.maksimum_kapasite) * 100
    }));
  },

  /**
   * Bildirimler
   */
  async getBildirimler(kullaniciId, limit = 20) {
    const { data, error } = await supabaseAdmin
      .from('bildirimler')
      .select(`
        bildirim_id,
        mesaj,
        bildirim_onceligi,
        bildirim_durumu,
        okundu_mi,
        olusturma_tarihi,
        bildirim_turleri!inner(bildirim_turu_adi)
      `)
      .eq('alici_kullanici_id', kullaniciId)
      .eq('okundu_mi', false)
      .order('olusturma_tarihi', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  },

  /**
   * Yük dengesizliği raporu (Load Balancing)
   * Danışman dağılımındaki adaletsizliği gösterir
   * @returns {Promise<Object>} Dengesizlik raporu
   */
  async getLoadImbalanceReport() {
    const { data, error } = await supabaseAdmin.rpc('get_load_imbalance_report');

    if (error) throw error;

    return data;
  },

  /**
   * Yeni öğrenci ataması için danışman önerisi
   * @param {string} ogrenciId - Öğrenci ID
   * @param {string} tezKonusu - Tez konusu (opsiyonel)
   * @returns {Promise<Array>} Önerilen danışman listesi (öncelik sırasına göre)
   */
  async suggestDanisman(ogrenciId, tezKonusu = null) {
    const { data, error } = await supabaseAdmin.rpc('suggest_danisman', {
      p_ogrenci_id: ogrenciId,
      p_tez_konusu: tezKonusu
    });

    if (error) throw error;

    return data;
  }
};

