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
        danisman_id: req.query.danisman_id,
        mevcut_asinama: req.query.mevcut_asinama,
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

  /**
   * Öğrenci yarıyıl hesaplama
   * GET /api/ogrenci/:id/yariyil
   */
  static async getYariyil(req, res, next) {
    try {
      const { id } = req.params;
      const yariyil = await ogrenciQueries.getYariyil(id);
      
      res.json({
        success: true,
        data: yariyil
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci durum geçişi (sadece Admin)
   * PATCH /api/ogrenci/:id/durum
   */
  static async updateDurum(req, res, next) {
    try {
      const { id } = req.params;
      const { durum_id, degisiklik_nedeni } = req.body;
      
      const result = await ogrenciQueries.updateDurum(id, durum_id, degisiklik_nedeni);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci durum geçmişi
   * GET /api/ogrenci/:id/durum-gecmisi
   */
  static async getDurumGecmisi(req, res, next) {
    try {
      const { id } = req.params;
      const gecmis = await ogrenciQueries.getDurumGecmisi(id);
      
      res.json({
        success: true,
        data: gecmis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci tez dönem kayıtları (Tezli YL)
   * GET /api/ogrenci/:id/tez-donem-kayitlari
   */
  static async getTezDonemKayitlari(req, res, next) {
    try {
      const { id } = req.params;
      const kayitlar = await ogrenciQueries.getTezDonemKayitlari(id);
      
      res.json({
        success: true,
        data: kayitlar
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tez dönem kaydı oluştur/güncelle (Danışman için)
   * POST /api/ogrenci/:id/tez-donem-kayitlari
   */
  static async createTezDonemKayit(req, res, next) {
    try {
      const { id } = req.params;
      const { yariyil, akademik_yil, danisman_degerlendirmesi, aciklama } = req.body;
      
      const result = await ogrenciQueries.createTezDonemKayit(id, {
        yariyil,
        akademik_yil,
        danisman_degerlendirmesi,
        aciklama
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

