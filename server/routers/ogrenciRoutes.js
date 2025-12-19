/**
 * Öğrenci Routes
 * Öğrenci işlemleri API endpoint'leri
 */

import express from 'express';
import { OgrenciController } from '../controllers/OgrenciController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tüm öğrenci route'ları authentication gerektirir
router.use(authenticate);

// Tüm öğrenciler (filtreleme ile)
router.get('/', OgrenciController.getAll);

// Öğrenci detayı
router.get('/:id', OgrenciController.getById);

// Öğrenci risk analizi
router.get('/:id/risk-analizi', OgrenciController.getRiskAnalizi);

export default router;

