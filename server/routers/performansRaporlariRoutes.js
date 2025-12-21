/**
 * Performans Raporları Routes
 */

import express from 'express';
import { PerformansRaporlariController } from '../controllers/PerformansRaporlariController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Tüm endpoint'ler authentication gerektirir
router.use(authenticate);

// Danışman performans raporu - Admin ve Bölüm Başkanı
router.get(
  '/danisman',
  authorizeRole(['Admin', 'Bolum_Baskani']),
  PerformansRaporlariController.getDanismanPerformansRaporu
);

// Program performans raporu - Tüm roller
router.get('/program', PerformansRaporlariController.getProgramPerformansRaporu);

// Dönem bazlı performans - Tüm roller
router.get('/donem', PerformansRaporlariController.getDonemBazliPerformans);

// Risk yönetimi skorları - Admin ve Bölüm Başkanı
router.get(
  '/risk-yonetimi',
  authorizeRole(['Admin', 'Bolum_Baskani']),
  PerformansRaporlariController.getRiskYonetimiSkorlari
);

export default router;

