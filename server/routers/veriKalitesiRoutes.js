/**
 * Veri Kalitesi Routes
 */

import express from 'express';
import { VeriKalitesiController } from '../controllers/VeriKalitesiController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Tüm endpoint'ler authentication gerektirir
router.use(authenticate);

// Admin ve Bölüm Başkanı erişebilir
router.use(authorizeRole(['Admin', 'Bolum_Baskani']));

// Excel yükleme geçmişi
router.get('/excel-yukleme-gecmisi', VeriKalitesiController.getExcelYuklemeGecmisi);

// Değişiklik logu
router.get('/degisiklik-logu', VeriKalitesiController.getDegisiklikLogu);

// Yükleme istatistikleri
router.get('/yukleme-istatistikleri', VeriKalitesiController.getYuklemeIstatistikleri);

// Değişiklik istatistikleri
router.get('/degisiklik-istatistikleri', VeriKalitesiController.getDegisiklikIstatistikleri);

// Veri doğrulama kontrolü
router.get('/veri-dogrulama', VeriKalitesiController.getVeriDogrulamaKontrolu);

export default router;

