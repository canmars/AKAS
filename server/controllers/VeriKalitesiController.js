/**
 * Veri Kalitesi Controller
 * Excel yükleme geçmişi, değişiklik logu ve veri doğrulama endpoint'leri
 */

import { veriKalitesiQueries } from '../db/queries/veriKalitesiQueries.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export class VeriKalitesiController {
  /**
   * Excel Yükleme Geçmişi
   * GET /api/veri-kalitesi/excel-yukleme-gecmisi
   */
  static getExcelYuklemeGecmisi = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    
    const data = await veriKalitesiQueries.getExcelYuklemeGecmisi(
      limit ? parseInt(limit) : 50
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Değişiklik Logu
   * GET /api/veri-kalitesi/degisiklik-logu
   */
  static getDegisiklikLogu = asyncHandler(async (req, res) => {
    const { tablo_adi, kayit_id, limit } = req.query;
    
    const data = await veriKalitesiQueries.getDegisiklikLogu(
      tablo_adi || null,
      kayit_id || null,
      limit ? parseInt(limit) : 100
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Yükleme İstatistikleri
   * GET /api/veri-kalitesi/yukleme-istatistikleri
   */
  static getYuklemeIstatistikleri = asyncHandler(async (req, res) => {
    const { baslangic_tarihi, bitis_tarihi } = req.query;
    
    const data = await veriKalitesiQueries.getYuklemeIstatistikleri(
      baslangic_tarihi || null,
      bitis_tarihi || null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Değişiklik İstatistikleri
   * GET /api/veri-kalitesi/degisiklik-istatistikleri
   */
  static getDegisiklikIstatistikleri = asyncHandler(async (req, res) => {
    const { baslangic_tarihi, bitis_tarihi } = req.query;
    
    const data = await veriKalitesiQueries.getDegisiklikIstatistikleri(
      baslangic_tarihi || null,
      bitis_tarihi || null
    );

    res.json({
      success: true,
      data
    });
  });

  /**
   * Veri Doğrulama Kontrolü
   * GET /api/veri-kalitesi/veri-dogrulama
   */
  static getVeriDogrulamaKontrolu = asyncHandler(async (req, res) => {
    const data = await veriKalitesiQueries.getVeriDogrulamaKontrolu();

    res.json({
      success: true,
      data
    });
  });
}

