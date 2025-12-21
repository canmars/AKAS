/**
 * Performans Raporları Controller
 * Danışman, program ve dönem bazlı performans raporları
 */

import { performansRaporlariQueries } from '../db/queries/performansRaporlariQueries.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class PerformansRaporlariController {
  /**
   * Danışman Performans Raporu
   * GET /api/performans-raporlari/danisman
   */
  static getDanismanPerformansRaporu = asyncHandler(async (req, res) => {
    const { danisman_id, yil_baslangic, yil_bitis } = req.query;
    
    const data = await performansRaporlariQueries.getDanismanPerformansRaporu(
      danisman_id || null,
      yil_baslangic ? parseInt(yil_baslangic) : null,
      yil_bitis ? parseInt(yil_bitis) : null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Program Performans Raporu
   * GET /api/performans-raporlari/program
   */
  static getProgramPerformansRaporu = asyncHandler(async (req, res) => {
    const { program_turu_id, akademik_yil } = req.query;
    
    const data = await performansRaporlariQueries.getProgramPerformansRaporu(
      program_turu_id || null,
      akademik_yil ? parseInt(akademik_yil) : null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Dönem Bazlı Performans Raporu
   * GET /api/performans-raporlari/donem
   */
  static getDonemBazliPerformans = asyncHandler(async (req, res) => {
    const { akademik_yil, donem } = req.query;
    
    const data = await performansRaporlariQueries.getDonemBazliPerformans(
      akademik_yil ? parseInt(akademik_yil) : null,
      donem || null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Risk Yönetimi Skorları
   * GET /api/performans-raporlari/risk-yonetimi
   */
  static getRiskYonetimiSkorlari = asyncHandler(async (req, res) => {
    const { danisman_id } = req.query;
    
    const data = await performansRaporlariQueries.getRiskYonetimiSkorlari(
      danisman_id || null
    );

    res.json({
      success: true,
      data
    });
  });
}

