/**
 * Akademik Personel Controller
 * Akademik personel iş mantığı
 */

import { akademikPersonelQueries } from '../db/queries/akademikPersonelQueries.js';

export class AkademikPersonelController {
  /**
   * Tüm akademik personel
   */
  static async getAll(req, res, next) {
    try {
      const personel = await akademikPersonelQueries.getAll();
      
      res.json({
        success: true,
        data: personel
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Akademik personel detayı
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const personel = await akademikPersonelQueries.getById(id);
      
      res.json({
        success: true,
        data: personel
      });
    } catch (error) {
      next(error);
    }
  }
}

