/**
 * Risk Analizi Routes
 * Risk analizi işlemleri API endpoint'leri
 */

import express from 'express';
import { RiskAnaliziController } from '../controllers/RiskAnaliziController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tüm risk analizi route'ları authentication gerektirir
router.use(authenticate);

// Tüm risk analizleri
router.get('/', RiskAnaliziController.getAll);

// Risk analizi detayı (analiz ID ile)
router.get('/:id', RiskAnaliziController.getById);

// Öğrenci için risk skoru hesapla
router.post('/hesapla/:ogrenciId', RiskAnaliziController.hesapla);

// Öğrenci için detaylı risk analizi
router.get('/ogrenci/:ogrenciId', RiskAnaliziController.getByOgrenciId);

// Risk faktörleri detayı (drill-down)
router.get('/drill-down/:ogrenciId', RiskAnaliziController.getDrillDown);

export default router;

