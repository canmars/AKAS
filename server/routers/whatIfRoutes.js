/**
 * What-If Routes
 * What-If simülasyon işlemleri API endpoint'leri
 */

import express from 'express';
import { WhatIfController } from '../controllers/WhatIfController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tüm what-if route'ları authentication gerektirir
router.use(authenticate);

// Simülasyon çalıştır
router.post('/simulasyon', WhatIfController.runSimulation);

// Simülasyon geçmişi
router.get('/gecmis', WhatIfController.getHistory);

export default router;

