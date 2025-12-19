/**
 * Öğrenci Controller
 * Öğrenci iş mantığı
 */

import { ogrenciQueries } from '../db/queries/ogrenciQueries.js';

export class OgrenciController {
  /**
   * Tüm öğrenciler (filtreleme ile)
   */
  static async getAll(req, res, next) {
    try {
      const filters = {
        program_turu_id: req.query.program_turu_id,
        durum_id: req.query.durum_id,
        min_risk_skoru: req.query.min_risk_skoru ? parseInt(req.query.min_risk_skoru) : undefined,
        max_risk_skoru: req.query.max_risk_skoru ? parseInt(req.query.max_risk_skoru) : undefined
      };

      const ogrenciler = await ogrenciQueries.getAll(filters);
      
      res.json({
        success: true,
        data: ogrenciler
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci detayı
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const ogrenci = await ogrenciQueries.getById(id);
      
      res.json({
        success: true,
        data: ogrenci
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci risk analizi
   */
  static async getRiskAnalizi(req, res, next) {
    try {
      const { id } = req.params;
      const riskAnalizi = await ogrenciQueries.getRiskAnalizi(id);
      
      res.json({
        success: true,
        data: riskAnalizi
      });
    } catch (error) {
      next(error);
    }
  }
}

