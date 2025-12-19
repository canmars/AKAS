/**
 * Risk Analizi Controller
 * Risk analizi iş mantığı
 */

import { riskAnaliziQueries } from '../db/queries/riskAnaliziQueries.js';

export class RiskAnaliziController {
  /**
   * Tüm risk analizleri
   */
  static async getAll(req, res, next) {
    try {
      const filters = {
        min_risk_skoru: req.query.min_risk_skoru ? parseInt(req.query.min_risk_skoru) : undefined,
        risk_seviyesi: req.query.risk_seviyesi
      };

      const riskAnalizleri = await riskAnaliziQueries.getAll(filters);
      
      res.json({
        success: true,
        data: riskAnalizleri
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Risk analizi detayı
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const riskAnalizi = await riskAnaliziQueries.getById(id);
      
      res.json({
        success: true,
        data: riskAnalizi
      });
    } catch (error) {
      next(error);
    }
  }
}

