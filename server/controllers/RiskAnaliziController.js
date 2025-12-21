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

  /**
   * Öğrenci için risk skoru hesapla
   * POST /api/risk-analizi/hesapla/:ogrenciId
   */
  static async hesapla(req, res, next) {
    try {
      const { ogrenciId } = req.params;
      const riskSkoru = await riskAnaliziQueries.hesaplaRiskSkoru(ogrenciId);
      
      res.json({
        success: true,
        data: riskSkoru
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci için detaylı risk analizi
   * GET /api/risk-analizi/:ogrenciId
   */
  static async getByOgrenciId(req, res, next) {
    try {
      const { ogrenciId } = req.params;
      const riskAnalizi = await riskAnaliziQueries.getByOgrenciId(ogrenciId);
      
      res.json({
        success: true,
        data: riskAnalizi
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Risk faktörleri detayı (drill-down)
   * GET /api/risk-analizi/drill-down/:ogrenciId
   */
  static async getDrillDown(req, res, next) {
    try {
      const { ogrenciId } = req.params;
      const drillDown = await riskAnaliziQueries.getDrillDown(ogrenciId);
      
      res.json({
        success: true,
        data: drillDown
      });
    } catch (error) {
      next(error);
    }
  }
}

