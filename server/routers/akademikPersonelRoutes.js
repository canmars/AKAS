/**
 * Akademik Personel Routes
 * Akademik personel işlemleri API endpoint'leri
 */

import express from 'express';
import { AkademikPersonelController } from '../controllers/AkademikPersonelController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Tüm akademik personel route'ları authentication gerektirir
router.use(authenticate);

// Tüm akademik personel
router.get('/', AkademikPersonelController.getAll);

// Akademik personel detayı
router.get('/:id', AkademikPersonelController.getById);

// Kapasite yönetimi
router.get('/kapasite', AkademikPersonelController.getKapasite);
router.post('/:id/kapasite', AkademikPersonelController.updateKapasite);

// Danışman önerisi
router.post('/oner-danisman', AkademikPersonelController.onerDanisman);

export default router;

