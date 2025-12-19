/**
 * Main Router
 * Tüm route'ları birleştirir
 */

import express from 'express';
import dashboardRoutes from './dashboardRoutes.js';
import ogrenciRoutes from './ogrenciRoutes.js';
import akademikPersonelRoutes from './akademikPersonelRoutes.js';
import riskAnaliziRoutes from './riskAnaliziRoutes.js';
import bildirimRoutes from './bildirimRoutes.js';
import whatIfRoutes from './whatIfRoutes.js';

const router = express.Router();

// Route'ları bağla
router.use('/dashboard', dashboardRoutes);
router.use('/ogrenci', ogrenciRoutes);
router.use('/akademik-personel', akademikPersonelRoutes);
router.use('/risk-analizi', riskAnaliziRoutes);
router.use('/bildirim', bildirimRoutes);
router.use('/what-if', whatIfRoutes);

export default router;

