/**
 * Akademik Takvim Controller
 */

import { akademikTakvimQueries } from '../db/queries/akademikTakvimQueries.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class AkademikTakvimController {
  static getAkademikTakvim = asyncHandler(async (req, res) => {
    const { akademik_yil, donem } = req.query;
    
    const data = await akademikTakvimQueries.getAkademikTakvim(
      akademik_yil ? parseInt(akademik_yil) : null,
      donem || null
    );

    res.json({ success: true, data });
  });

  static getAktifDonem = asyncHandler(async (req, res) => {
    const data = await akademikTakvimQueries.getAktifDonem();
    res.json({ success: true, data });
  });

  static getDonemBazliOgrenciSayilari = asyncHandler(async (req, res) => {
    const { akademik_yil } = req.query;
    const data = await akademikTakvimQueries.getDonemBazliOgrenciSayilari(
      akademik_yil ? parseInt(akademik_yil) : null
    );
    res.json({ success: true, data });
  });

  static getDonemBazliRiskDagilimi = asyncHandler(async (req, res) => {
    const { akademik_yil } = req.query;
    const data = await akademikTakvimQueries.getDonemBazliRiskDagilimi(
      akademik_yil ? parseInt(akademik_yil) : null
    );
    res.json({ success: true, data });
  });
}

