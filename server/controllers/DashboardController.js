/**
 * Dashboard Controller
 * Dashboard iş mantığı
 */

import { dashboardQueries } from '../db/queries/dashboardQueries.js';

export class DashboardController {
  /**
   * KPI metrikleri
   */
  static async getKPI(req, res, next) {
    try {
      const metrics = await dashboardQueries.getKPIMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Risk skoru dağılımı
   */
  static async getRiskDagilimi(req, res, next) {
    try {
      const dagilim = await dashboardQueries.getRiskDagilimi();
      
      res.json({
        success: true,
        data: dagilim
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Program bazında dağılım
   */
  static async getProgramDagilimi(req, res, next) {
    try {
      const dagilim = await dashboardQueries.getProgramDagilimi();
      
      res.json({
        success: true,
        data: dagilim
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kritik risk altındaki öğrenciler
   */
  static async getKritikOgrenciler(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const ogrenciler = await dashboardQueries.getKritikOgrenciler(limit);
      
      res.json({
        success: true,
        data: ogrenciler
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Danışman yük dağılımı
   */
  static async getDanismanYuk(req, res, next) {
    try {
      const yukDagilimi = await dashboardQueries.getDanismanYuk();
      
      res.json({
        success: true,
        data: yukDagilimi
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bildirimler
   */
  static async getBildirimler(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const bildirimler = await dashboardQueries.getBildirimler(req.user.id, limit);
      
      res.json({
        success: true,
        data: bildirimler
      });
    } catch (error) {
      next(error);
    }
  }
}

