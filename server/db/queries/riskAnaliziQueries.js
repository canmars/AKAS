/**
 * Risk Analizi Queries
 * Risk analizi tablosu için SQL sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const riskAnaliziQueries = {
  /**
   * Tüm risk analizlerini getir
   */
  async getAll(filters = {}) {
    let query = supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select(`
        *,
        ogrenci!inner(*)
      `)
      .order('hesaplama_tarihi', { ascending: false });

    if (filters.min_risk_skoru !== undefined) {
      query = query.gte('risk_skoru', filters.min_risk_skoru);
    }

    if (filters.risk_seviyesi) {
      query = query.eq('risk_seviyesi', filters.risk_seviyesi);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  },

  /**
   * Risk analizi detayı
   */
  async getById(analizId) {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select(`
        *,
        ogrenci!inner(*)
      `)
      .eq('analiz_id', analizId)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Öğrenci için risk skoru hesapla
   */
  async hesaplaRiskSkoru(ogrenciId) {
    const { data, error } = await supabaseAdmin.rpc('hesapla_risk_skoru', {
      p_ogrenci_id: ogrenciId
    });

    if (error) throw error;

    // Risk seviyesini belirle
    const riskSkoru = data || 0;
    const riskSeviyesi = 
      riskSkoru >= 85 ? 'Kritik' :
      riskSkoru >= 70 ? 'Yuksek' :
      riskSkoru >= 40 ? 'Orta' : 'Dusuk';

    // Risk analizi tablosuna kaydet
    const { data: analizData, error: analizError } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .insert({
        ogrenci_id: ogrenciId,
        risk_skoru: riskSkoru,
        risk_seviyesi: riskSeviyesi,
        tehlike_turu: 'Genel',
        hayalet_ogrenci_mi: false,
        hesaplama_tarihi: new Date().toISOString()
      })
      .select()
      .single();

    if (analizError && analizError.code !== '23505') { // Unique constraint violation is OK
      throw analizError;
    }

    return {
      risk_skoru: riskSkoru,
      risk_seviyesi: riskSeviyesi,
      hesaplama_tarihi: new Date().toISOString()
    };
  },

  /**
   * Öğrenci için detaylı risk analizi
   */
  async getByOgrenciId(ogrenciId) {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select(`
        *,
        ogrenci!inner(*)
      `)
      .eq('ogrenci_id', ogrenciId)
      .order('hesaplama_tarihi', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Not found is OK

    return data;
  },

  /**
   * Risk faktörleri detayı (drill-down)
   */
  async getDrillDown(ogrenciId) {
    // Öğrenci bilgilerini al
    const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select(`
        *,
        program_turleri!inner(program_kodu, program_adi)
      `)
      .eq('ogrenci_id', ogrenciId)
      .single();

    if (ogrenciError) throw ogrenciError;

    const programKodu = ogrenci.program_turleri.program_kodu;
    const riskFaktorleri = {};

    // Program türüne göre risk faktörlerini hesapla
    if (programKodu === 'Doktora') {
      const { data: tikRisk } = await supabaseAdmin.rpc('hesapla_tik_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: yeterlikRisk } = await supabaseAdmin.rpc('hesapla_yeterlik_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: tezOnersiRisk } = await supabaseAdmin.rpc('hesapla_tez_onersi_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: maksimumSureRisk } = await supabaseAdmin.rpc('hesapla_maksimum_sure_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: tezIlerlemeRisk } = await supabaseAdmin.rpc('hesapla_tez_ilerleme_risk', {
        p_ogrenci_id: ogrenciId
      });

      riskFaktorleri.tik_risk = { puan: tikRisk || 0, agirlik: 0.35 };
      riskFaktorleri.yeterlik_risk = { puan: yeterlikRisk || 0, agirlik: 0.25 };
      riskFaktorleri.tez_onersi_risk = { puan: tezOnersiRisk || 0, agirlik: 0.20 };
      riskFaktorleri.maksimum_sure_risk = { puan: maksimumSureRisk || 0, agirlik: 0.15 };
      riskFaktorleri.tez_ilerleme_risk = { puan: tezIlerlemeRisk || 0, agirlik: 0.05 };
    } else if (programKodu === 'Tezli_YL') {
      const { data: dersTamamlamaRisk } = await supabaseAdmin.rpc('hesapla_ders_tamamlama_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: tezDonemKayitRisk } = await supabaseAdmin.rpc('hesapla_tez_donem_kayit_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: danismanDegerlendirmeRisk } = await supabaseAdmin.rpc('hesapla_danisman_degerlendirme_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: maksimumSureRisk } = await supabaseAdmin.rpc('hesapla_maksimum_sure_risk', {
        p_ogrenci_id: ogrenciId
      });

      riskFaktorleri.ders_tamamlama_risk = { puan: dersTamamlamaRisk || 0, agirlik: 0.40 };
      riskFaktorleri.tez_donem_kayit_risk = { puan: tezDonemKayitRisk || 0, agirlik: 0.30 };
      riskFaktorleri.danisman_degerlendirme_risk = { puan: danismanDegerlendirmeRisk || 0, agirlik: 0.20 };
      riskFaktorleri.maksimum_sure_risk = { puan: maksimumSureRisk || 0, agirlik: 0.10 };
    } else if (programKodu === 'Tezsiz_YL_IO' || programKodu === 'Tezsiz_YL_Uzaktan') {
      const { data: hayaletOgrenciRisk } = await supabaseAdmin.rpc('hesapla_hayalet_ogrenci_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: dersTamamlamaTezsizRisk } = await supabaseAdmin.rpc('hesapla_ders_tamamlama_tezsiz_risk', {
        p_ogrenci_id: ogrenciId
      });
      const { data: donemProjesiRisk } = await supabaseAdmin.rpc('hesapla_donem_projesi_risk', {
        p_ogrenci_id: ogrenciId
      });

      riskFaktorleri.hayalet_ogrenci_risk = { puan: hayaletOgrenciRisk || 0, agirlik: 0.50 };
      riskFaktorleri.ders_tamamlama_tezsiz_risk = { puan: dersTamamlamaTezsizRisk || 0, agirlik: 0.30 };
      riskFaktorleri.donem_projesi_risk = { puan: donemProjesiRisk || 0, agirlik: 0.20 };
    }

    return {
      ogrenci_id: ogrenciId,
      program_kodu: programKodu,
      risk_faktorleri: riskFaktorleri
    };
  }
};

