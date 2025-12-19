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
    // Normalizasyon: ogrenci_mevcut_durum_view kullanılıyor (mevcut_yariyil, mevcut_asinama, ders_tamamlandi_mi, tamamlanan_ders_sayisi view'dan geliyor)
    let query = supabaseAdmin
      .from('ogrenci_mevcut_durum_view')
      .select(`
        ogrenci_id,
        kayit_tarihi,
        mevcut_yariyil,
        mevcut_asinama,
        ders_tamamlandi_mi,
        tamamlanan_ders_sayisi,
        son_login,
        mevcut_risk_skoru,
        risk_seviyesi,
        risk_skoru_hesaplama_tarihi
      `);

    // Filtreler
    if (filters.program_turu_id) {
      // View'den program_turu_id yok, ogrenci tablosuna join gerekir
      query = supabaseAdmin
        .from('ogrenci')
        .select(`
          ogrenci_id,
          kayit_tarihi,
          program_turu_id,
          durum_id,
          program_turleri!inner(program_adi, program_kodu),
          durum_turleri!inner(durum_adi, durum_kodu)
        `)
        .eq('program_turu_id', filters.program_turu_id)
        .eq('soft_delete', false);
    }

    if (filters.durum_id) {
      // View'den durum_id yok, ogrenci tablosuna join gerekir
      if (!filters.program_turu_id) {
        query = supabaseAdmin
          .from('ogrenci')
          .select(`
            ogrenci_id,
            kayit_tarihi,
            program_turu_id,
            durum_id,
            program_turleri!inner(program_adi, program_kodu),
            durum_turleri!inner(durum_adi, durum_kodu)
          `)
          .eq('durum_id', filters.durum_id)
          .eq('soft_delete', false);
      } else {
        query = query.eq('durum_id', filters.durum_id);
      }
    }

    if (filters.min_risk_skoru !== undefined) {
      // View üzerinden risk skoru filtresi
      if (query.from === 'ogrenci_mevcut_durum_view') {
        query = query.gte('mevcut_risk_skoru', filters.min_risk_skoru);
      }
    }

    if (filters.max_risk_skoru !== undefined) {
      if (query.from === 'ogrenci_mevcut_durum_view') {
        query = query.lte('mevcut_risk_skoru', filters.max_risk_skoru);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  },

  /**
   * Öğrenci detayı
   */
  async getById(ogrenciId) {
    const { data, error } = await supabaseAdmin
      .from('ogrenci')
      .select(`
        *,
        program_turleri!inner(*),
        durum_turleri!inner(*)
      `)
      .eq('ogrenci_id', ogrenciId)
      .eq('soft_delete', false)
      .single();

    if (error) throw error;

    return data;
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
  }
};

