/**
 * Bildirim Controller
 * Bildirim iş mantığı
 */

import { bildirimQueries } from '../db/queries/bildirimQueries.js';

export class BildirimController {
  /**
   * Tüm bildirimler
   */
  static async getAll(req, res, next) {
    try {
      const filters = {
        okundu_mi: req.query.okundu_mi === 'true' ? true : req.query.okundu_mi === 'false' ? false : undefined,
        bildirim_onceligi: req.query.bildirim_onceligi
      };

      const bildirimler = await bildirimQueries.getAll(req.user.id, filters);
      
      res.json({
        success: true,
        data: bildirimler
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bildirim detayı
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const bildirim = await bildirimQueries.getById(id);
      
      res.json({
        success: true,
        data: bildirim
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bildirimi okundu işaretle
   */
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const bildirim = await bildirimQueries.markAsRead(id);
      
      res.json({
        success: true,
        data: bildirim
      });
    } catch (error) {
      next(error);
    }
  }
}

