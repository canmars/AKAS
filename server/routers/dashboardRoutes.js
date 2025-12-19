/**
 * Dashboard Routes
 * Bölüm Başkanı dashboard API endpoint'leri
 */

import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tüm dashboard route'ları authentication gerektirir
router.use(authenticate);

// KPI metrikleri
router.get('/kpi', DashboardController.getKPI);

// Risk skoru dağılımı
router.get('/risk-dagilimi', DashboardController.getRiskDagilimi);

// Program bazında dağılım
router.get('/program-dagilimi', DashboardController.getProgramDagilimi);

// Kritik risk altındaki öğrenciler
router.get('/kritik-ogrenciler', DashboardController.getKritikOgrenciler);

// Danışman yük dağılımı
router.get('/danisman-yuk', DashboardController.getDanismanYuk);

// Bildirimler
router.get('/bildirimler', DashboardController.getBildirimler);

export default router;

