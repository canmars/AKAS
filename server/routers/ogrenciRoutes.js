/**
 * Öğrenci Routes
 * Öğrenci işlemleri API endpoint'leri
 */

import express from 'express';
import { OgrenciController } from '../controllers/OgrenciController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Development için authentication bypass, production için authenticate kullan
// NODE_ENV set edilmemişse development modunda olduğunu varsay
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';

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

// Tüm öğrenciler (filtreleme ile)
router.get('/', OgrenciController.getAll);

// Öğrenci detayı
router.get('/:id', OgrenciController.getById);

// Öğrenci risk analizi
router.get('/:id/risk-analizi', OgrenciController.getRiskAnalizi);

export default router;

