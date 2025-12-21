/**
 * Stratejik Analiz Controller
 * Başarı trendi, danışman performansı, darboğaz analizi endpoint'leri
 */

import { stratejikAnalizQueries } from '../db/queries/stratejikAnalizQueries.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class StratejikAnalizController {
  /**
   * Başarı Trendi Endpoint
   * GET /api/stratejik-analiz/basari-trendi
   */
  static getBasariTrendi = asyncHandler(async (req, res) => {
    const { ogrenci_id, akademik_yil, yariyil } = req.query;
    
    const data = await stratejikAnalizQueries.getBasariTrendi(
      ogrenci_id || null,
      akademik_yil ? parseInt(akademik_yil) : null,
      yariyil ? parseInt(yariyil) : null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Danışman Performans Endpoint
   * GET /api/stratejik-analiz/danisman-performans
   */
  static getDanismanPerformans = asyncHandler(async (req, res) => {
    const { danisman_id, akademik_yil } = req.query;
    
    const data = await stratejikAnalizQueries.getDanismanPerformans(
      danisman_id || null,
      akademik_yil ? parseInt(akademik_yil) : null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Süreç Darboğaz Analizi Endpoint
   * GET /api/stratejik-analiz/darbogaz
   */
  static getSurecDarbogaz = asyncHandler(async (req, res) => {
    const { asama, program_turu_id, akademik_yil } = req.query;
    
    const data = await stratejikAnalizQueries.getSurecDarbogaz(
      asama || null,
      program_turu_id || null,
      akademik_yil ? parseInt(akademik_yil) : null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Program Bazlı Başarı Karşılaştırması
   * GET /api/stratejik-analiz/program-basari
   */
  static getProgramBazliBasari = asyncHandler(async (req, res) => {
    const { akademik_yil } = req.query;
    
    const data = await stratejikAnalizQueries.getProgramBazliBasari(
      akademik_yil ? parseInt(akademik_yil) : null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Kritik Darboğazlar
   * GET /api/stratejik-analiz/kritik-darbogazlar
   */
  static getKritikDarbogazlar = asyncHandler(async (req, res) => {
    const data = await stratejikAnalizQueries.getKritikDarbogazlar();

    res.json({
      success: true,
      data
    });
  });

  /**
   * Danışman Performans Karşılaştırması
   * GET /api/stratejik-analiz/danisman-karsilastirma
   */
  static getDanismanKarsilastirma = asyncHandler(async (req, res) => {
    const { akademik_yil } = req.query;
    
    const data = await stratejikAnalizQueries.getDanismanPerformansKarsilastirma(
      akademik_yil ? parseInt(akademik_yil) : null
    );

    res.json({
      success: true,
      data
    });
  });
}

