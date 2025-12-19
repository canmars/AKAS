/**
 * Risk Analizi Model
 * Risk analizi iş mantığı ve validasyon
 * SQL tarafındaki fn_hesapla_ogrenci_riski fonksiyonunu kullanır
 */

import { supabaseAdmin } from '../db/connection.js';

export class RiskAnaliziModel {
  /**
   * Risk analizi veri validasyonu
   */
  static validate(data) {
    const errors = [];

    if (data.risk_skoru < 0 || data.risk_skoru > 100) {
      errors.push('Risk skoru 0-100 arası olmalıdır');
    }

    if (!data.risk_seviyesi) {
      errors.push('Risk seviyesi zorunludur');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Öğrenci risk skorunu hesapla (KDS fonksiyonu)
   * SQL tarafındaki fn_hesapla_ogrenci_riski fonksiyonunu çağırır
   * Formül: (Kalan Süre Oranı * 0.6) + (Aşama Tıkanıklığı * 0.3) + (Toplam TS * 5) + Hayalet Öğrenci (+30 puan)
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<number>} Risk skoru (0-100 arası)
   */
  static async hesaplaRiskSkoru(ogrenciId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('fn_hesapla_ogrenci_riski', {
        p_ogrenci_id: ogrenciId
      });

      if (error) {
        throw new Error(`Risk skoru hesaplanamadı: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      throw new Error(`Risk skoru hesaplama hatası: ${error.message}`);
    }
  }

  /**
   * Risk analizini güncelle
   * SQL tarafındaki update_risk_analizi fonksiyonunu çağırır
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<void>}
   */
  static async updateRiskAnalizi(ogrenciId) {
    try {
      const { error } = await supabaseAdmin.rpc('update_risk_analizi', {
        p_ogrenci_id: ogrenciId
      });

      if (error) {
        throw new Error(`Risk analizi güncellenemedi: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Risk analizi güncelleme hatası: ${error.message}`);
    }
  }

  /**
   * Risk faktörlerini getir
   * SQL tarafındaki get_risk_faktorleri fonksiyonunu çağırır
   * 
   * @param {string} ogrenciId - Öğrenci ID
   * @returns {Promise<Object>} Risk faktörleri (JSONB)
   */
  static async getRiskFaktorleri(ogrenciId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_risk_faktorleri', {
        p_ogrenci_id: ogrenciId
      });

      if (error) {
        throw new Error(`Risk faktörleri alınamadı: ${error.message}`);
      }

      return data || {};
    } catch (error) {
      throw new Error(`Risk faktörleri alma hatası: ${error.message}`);
    }
  }
}

