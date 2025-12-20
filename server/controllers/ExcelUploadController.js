/**
 * Excel Upload Controller
 * Excel veri yükleme endpoint'leri
 */

import { DataProcessingPipeline } from '../services/DataProcessingPipeline.js';
import multer from 'multer';
import { supabaseAdmin } from '../db/connection.js';

// Multer yapılandırması (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sadece Excel dosyalarına izin ver
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir'), false);
    }
  }
});

export class ExcelUploadController {
  /**
   * Excel dosyası yükle
   * POST /api/admin/excel-upload
   */
  static async uploadExcel(req, res, next) {
    try {
      // Dosya kontrolü (rol kontrolü middleware tarafından yapılıyor)
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'Excel dosyası yüklenmedi' }
        });
      }

      // DataProcessingPipeline ile işle
      const pipeline = new DataProcessingPipeline();
      const result = await pipeline.processExcelUpload(
        req.file.buffer,
        req.file.originalname,
        req.user.id
      );

      res.json({
        success: result.success,
        data: {
          yuklemeId: result.yuklemeId,
          toplamSatirSayisi: result.toplamSatirSayisi,
          basariliSatirSayisi: result.basariliSatirSayisi,
          hataliSatirSayisi: result.hataliSatirSayisi,
          hataDetaylari: result.hataDetaylari,
          yuklemeDurumu: result.yuklemeDurumu,
          islemSuresi: result.islemSuresi
        }
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Yükleme geçmişini getir
   * GET /api/admin/excel-upload/history
   */
  static async getUploadHistory(req, res, next) {
    try {
      // Kullanıcı kontrolü middleware tarafından yapılıyor
      const limit = parseInt(req.query.limit) || 20;
      const pipeline = new DataProcessingPipeline();
      const history = await pipeline.getUploadHistory(req.user.id, limit);

      res.json({
        success: true,
        data: history
      });

    } catch (error) {
      next(error);
    }
  }
}

// Multer middleware export
export const uploadMiddleware = upload.single('excelFile');

