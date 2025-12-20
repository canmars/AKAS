/**
 * Excel Upload Routes
 * Excel veri yükleme endpoint'leri
 */

import express from 'express';
import { ExcelUploadController, uploadMiddleware } from '../controllers/ExcelUploadController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin, requireBolumBaskani } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Excel yükleme endpoint'i (Admin veya Bölüm Başkanı)
router.post(
  '/upload',
  authenticate,
  requireBolumBaskani,
  uploadMiddleware,
  ExcelUploadController.uploadExcel
);

// Yükleme geçmişi endpoint'i (Admin veya Bölüm Başkanı)
router.get(
  '/history',
  authenticate,
  requireBolumBaskani,
  ExcelUploadController.getUploadHistory
);

export default router;

