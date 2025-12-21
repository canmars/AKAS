/**
 * Stratejik Analiz Routes
 */

import express from 'express';
import { StratejikAnalizController } from '../controllers/StratejikAnalizController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Tüm endpoint'ler authentication gerektirir
router.use(authenticate);

// Başarı trendi - Tüm roller erişebilir
router.get('/basari-trendi', StratejikAnalizController.getBasariTrendi);

// Danışman performansı - Admin ve Bölüm Başkanı
router.get(
  '/danisman-performans',
  authorizeRole(['Admin', 'Bolum_Baskani']),
  StratejikAnalizController.getDanismanPerformans
);

// Süreç darboğaz analizi - Tüm roller
router.get('/darbogaz', StratejikAnalizController.getSurecDarbogaz);

// Program bazlı başarı - Tüm roller
router.get('/program-basari', StratejikAnalizController.getProgramBazliBasari);

// Kritik darboğazlar - Admin ve Bölüm Başkanı
router.get(
  '/kritik-darbogazlar',
  authorizeRole(['Admin', 'Bolum_Baskani']),
  StratejikAnalizController.getKritikDarbogazlar
);

// Danışman performans karşılaştırması - Admin ve Bölüm Başkanı
router.get(
  '/danisman-karsilastirma',
  authorizeRole(['Admin', 'Bolum_Baskani']),
  StratejikAnalizController.getDanismanKarsilastirma
);

export default router;

