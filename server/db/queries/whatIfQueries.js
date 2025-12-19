/**
 * What-If Analysis Queries
 * Darboğaz simülasyonu için sorgular
 */

import { supabaseAdmin } from '../connection.js';

export const whatIfQueries = {
  /**
   * Gelecek yıl X kadar öğrenci alırsam ne olur? - Simülasyon hesaplama
   * @param {number} yeniOgrenciSayisi - Yeni alınacak öğrenci sayısı
   * @param {object} programTuruDagilimi - Program türü dağılımı (JSONB) - opsiyonel
   * @returns {Promise<Array>} Simülasyon sonuçları
   */
  async simulateFutureCapacity(yeniOgrenciSayisi, programTuruDagilimi = null) {
    const { data, error } = await supabaseAdmin.rpc('simulate_future_capacity', {
      p_yeni_ogrenci_sayisi: yeniOgrenciSayisi,
      p_program_turu_dagilimi: programTuruDagilimi
    });

    if (error) throw error;

    return data;
  },

  /**
   * Simülasyon senaryosu oluştur ve kaydet
   * @param {string} senaryoAdi - Senaryo adı
   * @param {number} yeniOgrenciSayisi - Yeni alınacak öğrenci sayısı
   * @param {object} programTuruDagilimi - Program türü dağılımı (JSONB) - opsiyonel
   * @param {string} olusturanKullaniciId - Senaryoyu oluşturan kullanıcı ID - opsiyonel
   * @returns {Promise<string>} Senaryo ID
   */
  async createSimulationScenario(senaryoAdi, yeniOgrenciSayisi, programTuruDagilimi = null, olusturanKullaniciId = null) {
    const { data, error } = await supabaseAdmin.rpc('create_simulation_scenario', {
      p_senaryo_adi: senaryoAdi,
      p_yeni_ogrenci_sayisi: yeniOgrenciSayisi,
      p_program_turu_dagilimi: programTuruDagilimi,
      p_olusturan_kullanici_id: olusturanKullaniciId
    });

    if (error) throw error;

    return data;
  },

  /**
   * Kaydedilmiş simülasyon senaryolarını getir
   * @param {number} limit - Limit
   * @returns {Promise<Array>} Senaryo listesi
   */
  async getSimulationScenarios(limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('simulasyon_senaryolari')
      .select('*')
      .order('olusturma_tarihi', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data;
  },

  /**
   * Belirli bir simülasyon senaryosunu getir
   * @param {string} senaryoId - Senaryo ID
   * @returns {Promise<Object>} Senaryo detayı
   */
  async getSimulationScenarioById(senaryoId) {
    const { data, error } = await supabaseAdmin
      .from('simulasyon_senaryolari')
      .select('*')
      .eq('senaryo_id', senaryoId)
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Simülasyon senaryosunu sil
   * @param {string} senaryoId - Senaryo ID
   * @returns {Promise<void>}
   */
  async deleteSimulationScenario(senaryoId) {
    const { error } = await supabaseAdmin
      .from('simulasyon_senaryolari')
      .delete()
      .eq('senaryo_id', senaryoId);

    if (error) throw error;
  }
};

