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

// Risk analizi detayı
router.get('/:id', RiskAnaliziController.getById);

export default router;

