/**
 * Stage Tracking Routes
 * Aşama takibi API endpoint'leri
 */

import express from 'express';
import { stageTrackingController } from '../controllers/stageTrackingController.js';

const router = express.Router();

// Aşama takibi özet
router.get('/summary', stageTrackingController.getSummary);

// Aşama bazlı dağılım (detaylı)
router.get('/stage-distribution', stageTrackingController.getStageDistribution);

// Süre analizi
router.get('/duration-analysis', stageTrackingController.getDurationAnalysis);

// Gecikme analizi ve riskli öğrenciler
router.get('/delayed-students', stageTrackingController.getDelayedStudents);

export default router;

