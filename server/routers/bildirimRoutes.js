/**
 * Bildirim Routes
 * Bildirim işlemleri API endpoint'leri
 */

import express from 'express';
import { BildirimController } from '../controllers/BildirimController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tüm bildirim route'ları authentication gerektirir
router.use(authenticate);

// Tüm bildirimler
router.get('/', BildirimController.getAll);

// Bildirim detayı
router.get('/:id', BildirimController.getById);

// Bildirimi okundu işaretle
router.patch('/:id/okundu', BildirimController.markAsRead);

export default router;

