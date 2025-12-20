/**
 * Dashboard Routes
 * Bölüm Başkanı dashboard API endpoint'leri
 */

import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Development için authentication bypass, production için authenticate kullan
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!isDevelopment) {
  // Production: Authentication zorunlu
  router.use(authenticate);
} else {
  // Development: Authentication optional (mock user ekle)
  router.use((req, res, next) => {
    // Development modunda mock user ekle
    if (!req.user) {
      req.user = { id: 'dev-user-id' };
    }
    next();
  });
}

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

// Attrition Data (Sessiz Ölüm Radarı)
router.get('/attrition-data', DashboardController.getAttritionData);

// Bottleneck Data (Darboğaz Hunisi)
router.get('/bottleneck-data', DashboardController.getBottleneckData);

// Süreç Hattı (DB mevcut aşama)
router.get('/surec-hatti', DashboardController.getSurecHatti);

// Öğrenci Dashboard
router.get('/ogrenci', DashboardController.getOgrenciDashboard);

// Danışman Dashboard
router.get('/danisman', DashboardController.getDanismanDashboard);

export default router;

