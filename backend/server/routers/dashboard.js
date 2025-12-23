/**
 * Dashboard Routes
 * Dashboard API endpoint'leri
 */

import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard özet
router.get('/summary', dashboardController.getSummary);

// Program dağılımı
router.get('/program-distribution', dashboardController.getProgramDistribution);

// Risk dağılımı
router.get('/risk-distribution', dashboardController.getRiskDistribution);

// Danışman yük analizi
router.get('/advisor-load', dashboardController.getAdvisorLoad);

// Aşama dağılımı
router.get('/stage-distribution', dashboardController.getStageDistribution);

// Ders başarısızlık analizi
router.get('/course-failure', dashboardController.getCourseFailure);

// Uyarılar
router.get('/alerts', dashboardController.getAlerts);

// Mezuniyet trendleri
router.get('/graduation-trends', dashboardController.getGraduationTrends);

// Yaklaşan son tarihler
router.get('/upcoming-deadlines', dashboardController.getUpcomingDeadlines);

export default router;

