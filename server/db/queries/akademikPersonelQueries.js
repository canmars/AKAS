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
  },

  /**
   * Tüm hocaların kapasite bilgileri
   */
  async getKapasite() {
    const { data, error } = await supabaseAdmin
      .from('akademik_personel_yuk_view')
      .select('*')
      .order('kapasite_kullanim_yuzdesi', { ascending: false });

    if (error) throw error;

    return data;
  },

  /**
   * Kapasite güncelleme
   */
  async updateKapasite(personelId, kapasiteData) {
    const { data, error } = await supabaseAdmin
      .from('akademik_personel')
      .update({
        maksimum_kapasite: kapasiteData.maksimum_kapasite,
        sert_limit: kapasiteData.sert_limit,
        yumusak_limit: kapasiteData.yumusak_limit
      })
      .eq('personel_id', personelId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Danışman önerisi
   */
  async onerDanisman(ogrenciId, programTuruId) {
    // Öğrenci bilgilerini al
    const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
      .from('ogrenci')
      .select('program_turu_id')
      .eq('ogrenci_id', ogrenciId)
      .single();

    if (ogrenciError) throw ogrenciError;

    // View'den kapasite bilgilerini al ve sırala
    const { data: kapasiteListesi, error: kapasiteError } = await supabaseAdmin
      .from('akademik_personel_yuk_view')
      .select('*')
      .order('kapasite_kullanim_yuzdesi', { ascending: true })
      .limit(10);

    if (kapasiteError) throw kapasiteError;

    return kapasiteListesi;
  }
};

