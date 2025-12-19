/**
 * Bildirim Queries
 * Bildirim tablosu için SQL sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const bildirimQueries = {
  /**
   * Tüm bildirimleri getir
   */
  async getAll(kullaniciId, filters = {}) {
    let query = supabaseAdmin
      .from('bildirimler')
      .select(`
        *,
        bildirim_turleri!inner(*)
      `)
      .eq('alici_kullanici_id', kullaniciId)
      .order('olusturma_tarihi', { ascending: false });

    if (filters.okundu_mi !== undefined) {
      query = query.eq('okundu_mi', filters.okundu_mi);
    }

    if (filters.bildirim_onceligi) {
      query = query.eq('bildirim_onceligi', filters.bildirim_onceligi);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  },

  /**
   * Bildirim detayı
   */
  async getById(bildirimId) {
    const { data, error } = await supabaseAdmin
      .from('bildirimler')
      .select(`
        *,
        bildirim_turleri!inner(*)
      `)
      .eq('bildirim_id', bildirimId)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Bildirimi okundu işaretle
   */
  async markAsRead(bildirimId) {
    const { data, error } = await supabaseAdmin
      .from('bildirimler')
      .update({
        okundu_mi: true,
        okunma_tarihi: new Date().toISOString()
      })
      .eq('bildirim_id', bildirimId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }
};

