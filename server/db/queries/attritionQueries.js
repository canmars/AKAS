/**
 * Attrition Radar Queries
 * Sessiz ölüm riski (hayalet öğrenci + riskli doktora) için sorgular
 */

import { supabaseAdmin } from '../connection.js';

export const attritionQueries = {
  /**
   * Kırmızı Alarm listesi - Aciliyet sırasına göre riskli öğrenciler
   * @param {number} limit - Limit (varsayılan: 50)
   * @returns {Promise<Array>} Aciliyet sırasına göre riskli öğrenci listesi
   */
  async getAttritionRadar(limit = 50) {
    const { data, error } = await supabaseAdmin.rpc('get_attrition_radar', {
      p_limit: limit
    });

    if (error) throw error;

    return data;
  },

  /**
   * Hayalet öğrenciler (6+ ay login yok)
   * @param {number} limit - Limit (varsayılan: 50)
   * @returns {Promise<Array>} Hayalet öğrenci listesi
   */
  async getHayaletOgrenciler(limit = 50) {
    const { data, error } = await supabaseAdmin.rpc('get_hayalet_ogrenciler', {
      p_limit: limit
    });

    if (error) throw error;

    return data;
  },

  /**
   * Riskli doktora öğrencileri (risk skoru 70+)
   * @param {number} limit - Limit (varsayılan: 50)
   * @returns {Promise<Array>} Riskli doktora öğrenci listesi
   */
  async getRiskliDoktoraOgrencileri(limit = 50) {
    const { data, error } = await supabaseAdmin.rpc('get_riskli_doktora_ogrencileri', {
      p_limit: limit
    });

    if (error) throw error;

    return data;
  }
};

