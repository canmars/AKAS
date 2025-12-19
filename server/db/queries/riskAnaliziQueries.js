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
  }
};

