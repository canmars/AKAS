/**
 * Milestone Queries
 * Milestone takibi ve TİK yönetimi sorguları
 */

import { supabaseAdmin } from '../connection.js';

export const milestoneQueries = {
  /**
   * Milestone Listesi
   */
  async getMilestoneListesi(ogrenciId = null, durum = null, milestoneTuru = null) {
    let query = supabaseAdmin
      .from('akademik_milestone')
      .select(`
        *,
        ogrenci!inner(ogrenci_id, ad, soyad, program_turleri!inner(program_adi))
      `)
      .order('hedef_tarih', { ascending: false });

    if (ogrenciId) {
      query = query.eq('ogrenci_id', ogrenciId);
    }
    if (durum) {
      query = query.eq('durum', durum);
    }
    if (milestoneTuru) {
      query = query.eq('milestone_turu', milestoneTuru);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Gecikmiş Milestone'lar
   */
  async getGecikmisMilestonelar() {
    const { data, error } = await supabaseAdmin
      .from('akademik_milestone')
      .select(`
        *,
        ogrenci!inner(ogrenci_id, ad, soyad)
      `)
      .eq('durum', 'Gecikmis')
      .order('hedef_tarih', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * TİK Toplantıları
   */
  async getTikToplantilari(ogrenciId = null) {
    let query = supabaseAdmin
      .from('tik_toplantilari')
      .select(`
        *,
        ogrenci!inner(ogrenci_id, ad, soyad)
      `)
      .order('toplanti_tarihi', { ascending: false });

    if (ogrenciId) {
      query = query.eq('ogrenci_id', ogrenciId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Yaklaşan TİK Toplantıları (1 ay içinde)
   */
  async getYaklasanTikToplantilari() {
    const today = new Date().toISOString().split('T')[0];
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('tik_toplantilari')
      .select(`
        *,
        ogrenci!inner(ogrenci_id, ad, soyad)
      `)
      .gte('toplanti_tarihi', today)
      .lte('toplanti_tarihi', oneMonthLater)
      .order('toplanti_tarihi', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * TİK Toplantı Kaydı Oluştur
   */
  async createTikToplanti(toplantiData) {
    const { data, error } = await supabaseAdmin
      .from('tik_toplantilari')
      .insert({
        ogrenci_id: toplantiData.ogrenci_id,
        toplanti_tarihi: toplantiData.toplanti_tarihi,
        katilim_durumu: toplantiData.katilim_durumu,
        rapor_verildi_mi: toplantiData.rapor_verildi_mi || false,
        rapor_tarihi: toplantiData.rapor_verildi_mi ? new Date().toISOString().split('T')[0] : null,
        rapor_icerigi: toplantiData.rapor_icerigi || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * TİK Takvimi Oluştur
   */
  async olusturTikTakvimi(ogrenciId, tezOnersiOnayTarihi) {
    const { data, error } = await supabaseAdmin.rpc('olustur_tik_takvimi', {
      p_ogrenci_id: ogrenciId,
      p_tez_onersi_onay_tarihi: tezOnersiOnayTarihi
    });

    if (error) throw error;
    return { message: 'TİK takvimi oluşturuldu', ogrenci_id: ogrenciId };
  },

  /**
   * Milestone Oluştur
   */
  async createMilestone(milestoneData) {
    const { data, error } = await supabaseAdmin
      .from('akademik_milestone')
      .insert({
        ogrenci_id: milestoneData.ogrenci_id,
        milestone_turu: milestoneData.milestone_turu,
        hedef_tarih: milestoneData.hedef_tarih,
        gerceklesme_tarihi: milestoneData.gerceklesme_tarihi || null,
        savunma_sonucu: milestoneData.savunma_sonucu || null,
        durum: milestoneData.durum || 'Beklemede',
        aciklama: milestoneData.aciklama || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Milestone Güncelle
   */
  async updateMilestone(milestoneId, updateData) {
    const { data, error } = await supabaseAdmin
      .from('akademik_milestone')
      .update({
        hedef_tarih: updateData.hedef_tarih,
        gerceklesme_tarihi: updateData.gerceklesme_tarihi,
        savunma_sonucu: updateData.savunma_sonucu,
        durum: updateData.durum,
        aciklama: updateData.aciklama
      })
      .eq('milestone_id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

