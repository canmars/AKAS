/**
 * Akademik Personel Model
 * Akademik personel iş mantığı ve validasyon
 * Kapasite yönetimi ve danışman yük hesaplama
 */

import { supabaseAdmin } from '../db/connection.js';

export class AkademikPersonelModel {
  /**
   * Akademik personel veri validasyonu
   */
  static validate(data) {
    const errors = [];

    if (!data.unvan) {
      errors.push('Unvan zorunludur');
    }

    if (!data.email) {
      errors.push('E-posta zorunludur');
    }

    if (data.maksimum_kapasite && data.maksimum_kapasite < 0) {
      errors.push('Maksimum kapasite negatif olamaz');
    }

    if (data.sert_limit && data.sert_limit < 0) {
      errors.push('Sert limit negatif olamaz');
    }

    if (data.yumusak_limit && data.yumusak_limit < 0) {
      errors.push('Yumuşak limit negatif olamaz');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Danışman kapasitesini kontrol et
   * SQL tarafındaki check_danisman_kapasite fonksiyonunu çağırır
   * 
   * @param {string} danismanId - Danışman ID
   * @returns {Promise<Object>} Kapasite kontrol sonucu
   */
  static async checkDanismanKapasite(danismanId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_danisman_kapasite', {
        p_danisman_id: danismanId
      });

      if (error) {
        throw new Error(`Kapasite kontrolü yapılamadı: ${error.message}`);
      }

      return data || {};
    } catch (error) {
      throw new Error(`Kapasite kontrolü hatası: ${error.message}`);
    }
  }

  /**
   * Danışman yükünü hesapla
   * SQL tarafındaki calculate_danisman_yuk fonksiyonunu çağırır
   * 
   * @param {string} danismanId - Danışman ID
   * @returns {Promise<Object>} Danışman yük bilgileri
   */
  static async calculateDanismanYuk(danismanId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('calculate_danisman_yuk', {
        p_danisman_id: danismanId
      });

      if (error) {
        throw new Error(`Danışman yükü hesaplanamadı: ${error.message}`);
      }

      return data || {};
    } catch (error) {
      throw new Error(`Danışman yükü hesaplama hatası: ${error.message}`);
    }
  }
}

