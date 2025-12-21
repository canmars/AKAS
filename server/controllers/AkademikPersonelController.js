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

  /**
   * Tüm hocaların kapasite bilgileri
   * GET /api/akademik-personel/kapasite
   */
  static async getKapasite(req, res, next) {
    try {
      const kapasite = await akademikPersonelQueries.getKapasite();
      
      res.json({
        success: true,
        data: kapasite
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kapasite güncelleme (Admin)
   * POST /api/akademik-personel/:id/kapasite
   */
  static async updateKapasite(req, res, next) {
    try {
      const { id } = req.params;
      const { maksimum_kapasite, sert_limit, yumusak_limit } = req.body;
      
      const result = await akademikPersonelQueries.updateKapasite(id, {
        maksimum_kapasite,
        sert_limit,
        yumusak_limit
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Danışman önerisi
   * POST /api/akademik-personel/oner-danisman
   */
  static async onerDanisman(req, res, next) {
    try {
      const { ogrenci_id, program_turu_id } = req.body;
      
      const oneriler = await akademikPersonelQueries.onerDanisman(ogrenci_id, program_turu_id);
      
      res.json({
        success: true,
        data: oneriler
      });
    } catch (error) {
      next(error);
    }
  }
}

