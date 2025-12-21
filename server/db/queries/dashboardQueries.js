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

    // Toplam aktif öğrenci sayısı (ogrenci tablosundan - soft_delete = false olanlar)
    const { count: toplamOgrenciCount, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('ogrenci_id', { count: 'exact', head: true })
      .eq('soft_delete', false);

    if (ogrenciError) throw ogrenciError;
    
    // Toplam Riskli: Risk skoru 70+ öğrenci sayısı
    const toplamRiskli = viewData.filter(o => o.mevcut_risk_skoru >= 70).length;

    // Hayalet öğrenciler (180 gün login yok)
    const yuzSeksenGunOnce = new Date();
    yuzSeksenGunOnce.setDate(yuzSeksenGunOnce.getDate() - 180);
    
    const hayaletOgrenciSayisi = viewData.filter(o => {
      if (!o.son_login) return true;
      return new Date(o.son_login) < yuzSeksenGunOnce;
    }).length;

    // Kritik Darboğaz: ACİL_EYLEM statüsündeki öğrenci sayısı
    const { data: bottleneckData, error: bottleneckError } = await supabaseAdmin
      .from('ogrenci_seminer_darbogaz_view')
      .select('ogrenci_id')
      .eq('durum_statüsü', 'ACİL_EYLEM');

    const kritikDarbogazSayisi = bottleneckError ? 0 : bottleneckData.length;

    // Kapasite Alarmı: Sert limit aşan danışman sayısı
    // akademik_personel_yuk_view ve akademik_personel tablolarını birleştir
    const { data: personelData, error: personelError } = await supabaseAdmin
      .from('akademik_personel')
      .select('personel_id, sert_limit, maksimum_kapasite')
      .eq('aktif_mi', true);

    let kapasiteAlarmSayisi = 0;
    if (!personelError && personelData) {
      // Her personel için yük bilgisini al ve kontrol et
      for (const personel of personelData) {
        const { data: yukData } = await supabaseAdmin
          .from('akademik_personel_yuk_view')
          .select('mevcut_yuk')
          .eq('personel_id', personel.personel_id)
          .single();
        
        const mevcut_yuk = yukData?.mevcut_yuk || 0;
        const sert_limit = personel.sert_limit || personel.maksimum_kapasite || 10;
        
        if (mevcut_yuk >= sert_limit) {
          kapasiteAlarmSayisi++;
        }
      }
    }

    return {
      toplamRiskli,
      kritikDarbogaz: kritikDarbogazSayisi,
      kapasiteAlarmi: kapasiteAlarmSayisi,
      hayaletOgrenci: hayaletOgrenciSayisi,
      toplamOgrenci: toplamOgrenciCount || 0
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
    // Not: Frontend'te tıklamayla doğru öğrenci listesine gidebilmek için
    // program_turu_id bilgisini de döndürüyoruz.
    const { data: ogrenciler, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('program_turu_id')
      .eq('soft_delete', false)
      .not('program_turu_id', 'is', null);

    if (ogrenciError) throw ogrenciError;

    const countMap = {};
    ogrenciler.forEach(o => {
      if (!o.program_turu_id) return;
      countMap[o.program_turu_id] = (countMap[o.program_turu_id] || 0) + 1;
    });

    const programIds = Object.keys(countMap);
    if (programIds.length === 0) return [];

    const { data: programlar, error: programError } = await supabaseAdmin
      .from('program_turleri')
      .select('program_turu_id, program_adi, program_kodu')
      .in('program_turu_id', programIds);

    if (programError) throw programError;

    const result = programlar
      .map(p => ({
        program_turu_id: p.program_turu_id,
        program_adi: p.program_adi,
        program_kodu: p.program_kodu,
        ogrenci_sayisi: countMap[p.program_turu_id] || 0
      }))
      .filter(x => x.ogrenci_sayisi > 0)
      .sort((a, b) => b.ogrenci_sayisi - a.ogrenci_sayisi);

    return result;
  },

  /**
   * Süreç hattı dağılımı (gerçek DB aşaması: ogrenci_akademik_durum.mevcut_asinama)
   * Risk grupları: normal (0-49), uyari (50-69), kritik (70+)
   */
  async getSurecHattiDagilimi() {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_mevcut_durum_view')
      .select('ogrenci_id, mevcut_asinama, mevcut_risk_skoru')
      .not('mevcut_asinama', 'is', null);

    if (error) throw error;

    const order = ['Ders', 'Yeterlik', 'Tez_Onersi', 'TIK', 'Tez', 'Tamamlandi'];
    const map = {};
    order.forEach(a => {
      map[a] = { asama: a, normal: 0, uyari: 0, kritik: 0, toplam: 0 };
    });

    data.forEach(r => {
      const asama = r.mevcut_asinama;
      if (!asama) return;
      if (!map[asama]) {
        map[asama] = { asama, normal: 0, uyari: 0, kritik: 0, toplam: 0 };
      }
      const skor = Number(r.mevcut_risk_skoru || 0);
      if (skor >= 70) map[asama].kritik += 1;
      else if (skor >= 50) map[asama].uyari += 1;
      else map[asama].normal += 1;
      map[asama].toplam += 1;
    });

    const result = Object.values(map).filter(x => x.toplam > 0);
    // order dışı aşamalar varsa en sona ekle
    result.sort((a, b) => {
      const ia = order.indexOf(a.asama);
      const ib = order.indexOf(b.asama);
      if (ia === -1 && ib === -1) return a.asama.localeCompare(b.asama);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return result;
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
    const { data: viewData, error: viewError } = await supabaseAdmin
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

    if (viewError) throw viewError;

    // Her personel için sert_limit ve yumusak_limit bilgilerini al
    const personelList = await Promise.all(viewData.map(async (p) => {
      const { data: personelData, error: personelError } = await supabaseAdmin
        .from('akademik_personel')
        .select('sert_limit, yumusak_limit')
        .eq('personel_id', p.personel_id)
        .single();

      if (personelError) {
        return {
          ...p,
          kapasiteKullanimYuzdesi: (p.mevcut_yuk / p.maksimum_kapasite) * 100,
          sert_limit: p.maksimum_kapasite,
          yumusak_limit: Math.floor(p.maksimum_kapasite * 0.8),
          limit_asildi_mi: false,
          uyari_seviyesi_mi: false
        };
      }

      const sert_limit = personelData.sert_limit || p.maksimum_kapasite;
      const yumusak_limit = personelData.yumusak_limit || Math.floor(p.maksimum_kapasite * 0.8);
      const limit_asildi_mi = p.mevcut_yuk >= sert_limit;
      const uyari_seviyesi_mi = p.mevcut_yuk >= yumusak_limit && !limit_asildi_mi;

      return {
        ...p,
        kapasiteKullanimYuzdesi: (p.mevcut_yuk / p.maksimum_kapasite) * 100,
        sert_limit,
        yumusak_limit,
        limit_asildi_mi,
        uyari_seviyesi_mi
      };
    }));

    return personelList;
  },

  /**
   * Attrition Data (Sessiz Ölüm Radarı için)
   * Son giriş gün sayısı ve risk skoru verileri
   */
  async getAttritionData() {
    // Öğrenci verilerini al (program bilgisi olmadan)
    const { data: ogrenciData, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('ogrenci_id, ad, soyad, son_login, program_turu_id')
      .eq('soft_delete', false);

    if (ogrenciError) throw ogrenciError;

    // Program bilgilerini ayrı sorgu ile al
    const programIds = [...new Set(ogrenciData.map(o => o.program_turu_id).filter(Boolean))];
    const programMap = {};
    
    if (programIds.length > 0) {
      const { data: programData, error: programError } = await supabaseAdmin
        .from('program_turleri')
        .select('program_turu_id, program_adi, program_kodu')
        .in('program_turu_id', programIds);

      if (programError) throw programError;

      programData.forEach(p => {
        programMap[p.program_turu_id] = {
          program_adi: p.program_adi,
          program_kodu: p.program_kodu
        };
      });
    }

    // Risk skorlarını al
    const { data: riskData, error: riskError } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select('ogrenci_id, risk_skoru')
      .order('hesaplama_tarihi', { ascending: false });

    if (riskError) throw riskError;

    // En son risk skorlarını map'le
    const riskMap = {};
    riskData.forEach(r => {
      if (!riskMap[r.ogrenci_id]) {
        riskMap[r.ogrenci_id] = r.risk_skoru;
      }
    });

    // Her öğrenci için gün sayısını hesapla
    const now = new Date();
    const result = ogrenciData.map(ogrenci => {
      let gun_sayisi = 999; // NULL ise 999 gün olarak işaretle
      
      if (ogrenci.son_login) {
        const sonLoginDate = new Date(ogrenci.son_login);
        const diffTime = now - sonLoginDate;
        gun_sayisi = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      const programInfo = ogrenci.program_turu_id ? programMap[ogrenci.program_turu_id] : null;

      return {
        ogrenci_id: ogrenci.ogrenci_id,
        ad: ogrenci.ad,
        soyad: ogrenci.soyad,
        gun_sayisi,
        risk_skoru: riskMap[ogrenci.ogrenci_id] || 0,
        program_adi: programInfo?.program_adi || 'N/A',
        program_kodu: programInfo?.program_kodu || null
      };
    });

    return result;
  },

  /**
   * Bottleneck Data (Darboğaz Hunisi için)
   * TÜM öğrencileri getir (sadece ACİL_EYLEM değil)
   * Grafik kategorilere göre gruplayacak
   * NOT: View zaten soft_delete = false olanları getiriyor
   */
  async getBottleneckData() {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_seminer_darbogaz_view')
      .select('*');

    if (error) throw error;

    return data;
  },

  /**
   * Bildirimler
   */
  async getBildirimler(kullaniciId, limit = 20) {
    let query = supabaseAdmin
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
      .eq('okundu_mi', false)
      .order('olusturma_tarihi', { ascending: false })
      .limit(limit);

    if (kullaniciId) {
      query = query.eq('kullanici_id', kullaniciId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  }
};
