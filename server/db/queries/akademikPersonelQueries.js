/**
 * Akademik Personel Queries
 * Akademik personel tablosu için SQL sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const akademikPersonelQueries = {
  /**
   * Tüm akademik personeli getir
   */
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('akademik_personel')
      .select(`
        *,
        anabilim_dallari!inner(*)
      `)
      .eq('aktif_mi', true)
      .order('unvan', { ascending: true });

    if (error) throw error;

    return data;
  },

  /**
   * Akademik personel detayı
   */
  async getById(personelId) {
    const { data, error } = await supabaseAdmin
      .from('akademik_personel')
      .select(`
        *,
        anabilim_dallari!inner(*),
        akademik_personel_uzmanlik(*)
      `)
      .eq('personel_id', personelId)
      .single();

    if (error) throw error;

    return data;
  }
};

