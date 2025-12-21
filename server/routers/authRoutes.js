/**
 * Auth Routes
 * Kullanıcı kimlik doğrulama endpoint'leri
 */

import express from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();

// Login endpoint
router.post('/login', AuthController.login);

// Logout endpoint (opsiyonel)
router.post('/logout', AuthController.logout);

// Me endpoint (kullanıcı bilgilerini getir)
router.get('/me', AuthController.getMe);

export default router;

