/**
 * Öğrenci Queries
 * Öğrenci tablosu için SQL sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const ogrenciQueries = {
  /**
   * Tüm öğrencileri getir (filtreleme ile)
   */
  async getAll(filters = {}) {
    const hasViewFilter =
      filters.min_risk_skoru !== undefined ||
      filters.max_risk_skoru !== undefined ||
      !!filters.mevcut_asinama;

    // 1) Aday öğrenci ID'lerini belirle
    let candidateIds = null;
    let viewRows = null;

    if (hasViewFilter) {
      let vq = supabaseAdmin
        .from('ogrenci_mevcut_durum_view')
        .select(`
          ogrenci_id,
          mevcut_yariyil,
          mevcut_asinama,
          ders_tamamlandi_mi,
          tamamlanan_ders_sayisi,
          son_login,
          mevcut_risk_skoru,
          risk_seviyesi,
          risk_skoru_hesaplama_tarihi
        `);

      if (filters.mevcut_asinama) vq = vq.eq('mevcut_asinama', filters.mevcut_asinama);
      if (filters.min_risk_skoru !== undefined) vq = vq.gte('mevcut_risk_skoru', filters.min_risk_skoru);
      if (filters.max_risk_skoru !== undefined) vq = vq.lte('mevcut_risk_skoru', filters.max_risk_skoru);

      const { data: vData, error: vError } = await vq;
      if (vError) throw vError;

      viewRows = vData || [];
      candidateIds = viewRows.map(r => r.ogrenci_id);
      if (candidateIds.length === 0) return [];
    }

    // 2) Danışman filtresi için öğrenci ID'lerini belirle (danisman_gecmisi dahil)
    // View mantığı: danisman_gecmisi.aktif_mi = true AND ogrenci.soft_delete = false
    // AND ogrenci.durum_id IN (SELECT durum_id FROM durum_turleri WHERE durum_kodu IN ('Aktif', 'Dondurdu'))
    let danismanOgrenciIds = null;
    if (filters.danisman_id) {
      // 1) ogrenci.danisman_id'den gelenler (direkt atama)
      const { data: ogrenciDirect } = await supabaseAdmin
        .from('ogrenci')
        .select('ogrenci_id')
        .eq('danisman_id', filters.danisman_id)
        .eq('soft_delete', false);
      
      // 2) danisman_gecmisi'nden aktif danışman kayıtlarını al
      const { data: danismanGecmisiData } = await supabaseAdmin
        .from('danisman_gecmisi')
        .select('ogrenci_id')
        .eq('danisman_id', filters.danisman_id)
        .eq('aktif_mi', true);
      
      const directIds = (ogrenciDirect || []).map(o => o.ogrenci_id);
      const gecmisIds = (danismanGecmisiData || []).map(dg => dg.ogrenci_id);
      const allCandidateIds = [...new Set([...directIds, ...gecmisIds])];
      
      if (allCandidateIds.length === 0) return [];
      
      // 3) Bu öğrencilerin soft_delete = false ve durum kontrolü yap
      // (View mantığıyla aynı: sadece 'Aktif' ve 'Dondurdu' durumları)
      const { data: durumTurleri } = await supabaseAdmin
        .from('durum_turleri')
        .select('durum_id')
        .in('durum_kodu', ['Aktif', 'Dondurdu']);
      
      const gecerliDurumIds = (durumTurleri || []).map(d => d.durum_id);
      
      const { data: gecerliOgrenciler } = await supabaseAdmin
        .from('ogrenci')
        .select('ogrenci_id')
        .in('ogrenci_id', allCandidateIds)
        .eq('soft_delete', false)
        .in('durum_id', gecerliDurumIds);
      
      danismanOgrenciIds = (gecerliOgrenciler || []).map(o => o.ogrenci_id);
      
      if (danismanOgrenciIds.length === 0) return [];
    }

    // 3) Base öğrenci bilgilerini al (ad/soyad/program/danisman)
    let oq = supabaseAdmin
      .from('ogrenci')
      .select(`
        ogrenci_id,
        ad,
        soyad,
        kayit_tarihi,
        program_turu_id,
        durum_id,
        danisman_id
      `)
      .eq('soft_delete', false);

    if (filters.program_turu_id) oq = oq.eq('program_turu_id', filters.program_turu_id);
    if (filters.durum_id) oq = oq.eq('durum_id', filters.durum_id);
    if (danismanOgrenciIds) oq = oq.in('ogrenci_id', danismanOgrenciIds);
    if (candidateIds) oq = oq.in('ogrenci_id', candidateIds);

    const { data: ogrenciler, error: ogrenciError } = await oq;
    if (ogrenciError) throw ogrenciError;

    if (!ogrenciler || ogrenciler.length === 0) return [];

    // 4) View verisini al (eğer daha önce alınmadıysa) ve map'le
    const ogrenciIds = ogrenciler.map(o => o.ogrenci_id);
    if (!viewRows) {
      const { data: vData, error: vError } = await supabaseAdmin
        .from('ogrenci_mevcut_durum_view')
        .select(`
          ogrenci_id,
          mevcut_yariyil,
          mevcut_asinama,
          ders_tamamlandi_mi,
          tamamlanan_ders_sayisi,
          son_login,
          mevcut_risk_skoru,
          risk_seviyesi,
          risk_skoru_hesaplama_tarihi
        `)
        .in('ogrenci_id', ogrenciIds);

      if (vError) throw vError;
      viewRows = vData || [];
    }

    const viewMap = {};
    viewRows.forEach(v => {
      viewMap[v.ogrenci_id] = v;
    });

    // 5) Program ve durum bilgilerini batch al
    const programIds = [...new Set(ogrenciler.map(o => o.program_turu_id).filter(Boolean))];
    const durumIds = [...new Set(ogrenciler.map(o => o.durum_id).filter(Boolean))];

    const [programlarResult, durumlarResult] = await Promise.all([
      programIds.length > 0
        ? supabaseAdmin.from('program_turleri').select('program_turu_id, program_adi, program_kodu').in('program_turu_id', programIds)
        : { data: [], error: null },
      durumIds.length > 0
        ? supabaseAdmin.from('durum_turleri').select('durum_id, durum_adi, durum_kodu').in('durum_id', durumIds)
        : { data: [], error: null }
    ]);

    if (programlarResult.error) throw programlarResult.error;
    if (durumlarResult.error) throw durumlarResult.error;

    const programMap = {};
    programlarResult.data.forEach(p => {
      programMap[p.program_turu_id] = p;
    });

    const durumMap = {};
    durumlarResult.data.forEach(d => {
      durumMap[d.durum_id] = d;
    });

    // 6) gun_sayisi hesapla (modal risk nedenleri için)
    const now = Date.now();
    const calcGunSayisi = (sonLogin) => {
      if (!sonLogin) return 999;
      const t = new Date(sonLogin).getTime();
      if (!Number.isFinite(t)) return 999;
      return Math.floor((now - t) / (1000 * 60 * 60 * 24));
    };

    return ogrenciler.map(o => {
      const v = viewMap[o.ogrenci_id] || {};
      const program = programMap[o.program_turu_id];
      const durum = durumMap[o.durum_id];
      const mevcutRisk = v.mevcut_risk_skoru ?? 0;

      return {
        ogrenci_id: o.ogrenci_id,
        ad: o.ad,
        soyad: o.soyad,
        kayit_tarihi: o.kayit_tarihi,
        program_turu_id: o.program_turu_id,
        durum_id: o.durum_id,
        danisman_id: o.danisman_id,

        // View / karar destek alanları
        mevcut_yariyil: v.mevcut_yariyil ?? null,
        mevcut_asinama: v.mevcut_asinama ?? null,
        ders_tamamlandi_mi: v.ders_tamamlandi_mi ?? null,
        tamamlanan_ders_sayisi: v.tamamlanan_ders_sayisi ?? null,
        son_login: v.son_login ?? null,
        gun_sayisi: calcGunSayisi(v.son_login),
        mevcut_risk_skoru: mevcutRisk,
        risk_skoru: mevcutRisk, // backward compat
        risk_seviyesi: v.risk_seviyesi ?? null,
        risk_skoru_hesaplama_tarihi: v.risk_skoru_hesaplama_tarihi ?? null,

        // Lookup alanları
        program_adi: program?.program_adi,
        program_kodu: program?.program_kodu,
        durum_adi: durum?.durum_adi,
        durum_kodu: durum?.durum_kodu,
        program_turleri: program,
        durum_turleri: durum
      };
    });
  },

  /**
   * Öğrenci detayı
   */
  async getById(ogrenciId) {
    // İki aşamalı sorgu: Önce öğrenci bilgilerini al, sonra ilişkili tabloları
    const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .eq('soft_delete', false)
      .single();

    if (ogrenciError) throw ogrenciError;
    if (!ogrenci) return null;

    // Program bilgilerini al
    const { data: program, error: programError } = await supabaseAdmin
      .from('program_turleri')
      .select('*')
      .eq('program_turu_id', ogrenci.program_turu_id)
      .single();

    if (programError) throw programError;

    // Durum bilgilerini al
    const { data: durum, error: durumError } = await supabaseAdmin
      .from('durum_turleri')
      .select('*')
      .eq('durum_id', ogrenci.durum_id)
      .single();

    if (durumError) throw durumError;

    // Verileri birleştir
    return {
      ...ogrenci,
      program_turleri: program,
      durum_turleri: durum
    };
  },

  /**
   * Öğrenci risk analizi
   */
  async getRiskAnalizi(ogrenciId) {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .order('hesaplama_tarihi', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Öğrenci yarıyıl hesaplama
   */
  async getYariyil(ogrenciId) {
    // Öğrenci kayıt tarihini al
    const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('kayit_tarihi')
      .eq('ogrenci_id', ogrenciId)
      .single();

    if (ogrenciError) throw ogrenciError;

    // Yarıyıl hesapla
    const { data: yariyil, error: yariyilError } = await supabaseAdmin.rpc('calculate_yariyil', {
      p_kayit_tarihi: ogrenci.kayit_tarihi,
      p_bugun_tarihi: new Date().toISOString().split('T')[0]
    });

    if (yariyilError) throw yariyilError;

    return {
      ogrenci_id: ogrenciId,
      kayit_tarihi: ogrenci.kayit_tarihi,
      mevcut_yariyil: yariyil
    };
  },

  /**
   * Öğrenci durum geçişi (sadece Admin)
   */
  async updateDurum(ogrenciId, durumId, degisiklikNedeni) {
    // Mevcut durumu al
    const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('durum_id')
      .eq('ogrenci_id', ogrenciId)
      .single();

    if (ogrenciError) throw ogrenciError;

    const eskiDurumId = ogrenci.durum_id;

    // Durumu güncelle
    const { data: updatedOgrenci, error: updateError } = await supabaseAdmin
      .from('ogrenci')
      .update({ durum_id: durumId })
      .eq('ogrenci_id', ogrenciId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Durum geçmişine kaydet
    const { data: durumGecmisi, error: gecmisError } = await supabaseAdmin
      .from('ogrenci_durum_gecmisi')
      .insert({
        ogrenci_id: ogrenciId,
        eski_durum_id: eskiDurumId,
        yeni_durum_id: durumId,
        degisiklik_nedeni: degisiklikNedeni || 'Manuel durum değişikliği',
        otomatik_mi: false
      })
      .select()
      .single();

    if (gecmisError) throw gecmisError;

    return {
      ogrenci: updatedOgrenci,
      durum_gecmisi: durumGecmisi
    };
  },

  /**
   * Öğrenci durum geçmişi
   */
  async getDurumGecmisi(ogrenciId) {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_durum_gecmisi')
      .select(`
        *,
        eski_durum:durum_turleri!ogrenci_durum_gecmisi_eski_durum_id_fkey(*),
        yeni_durum:durum_turleri!ogrenci_durum_gecmisi_yeni_durum_id_fkey(*)
      `)
      .eq('ogrenci_id', ogrenciId)
      .order('degisiklik_tarihi', { ascending: false });

    if (error) throw error;

    return data;
  },

  /**
   * Öğrenci tez dönem kayıtları (Tezli YL)
   */
  async getTezDonemKayitlari(ogrenciId) {
    const { data, error } = await supabaseAdmin
      .from('tez_donem_kayitlari')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .order('yariyil', { ascending: false })
      .order('akademik_yil', { ascending: false });

    if (error) throw error;

    return data;
  },

  /**
   * Tez dönem kaydı oluştur/güncelle
   */
  async createTezDonemKayit(ogrenciId, kayitData) {
    const { data, error } = await supabaseAdmin
      .from('tez_donem_kayitlari')
      .upsert({
        ogrenci_id: ogrenciId,
        yariyil: kayitData.yariyil,
        akademik_yil: kayitData.akademik_yil,
        danisman_degerlendirmesi: kayitData.danisman_degerlendirmesi,
        degerlendirme_tarihi: new Date().toISOString().split('T')[0],
        aciklama: kayitData.aciklama
      }, {
        onConflict: 'ogrenci_id,yariyil,akademik_yil'
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }
};

