/**
 * Main Router
 * Tüm route'ları birleştirir
 */

import express from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import ogrenciRoutes from './ogrenciRoutes.js';
import akademikPersonelRoutes from './akademikPersonelRoutes.js';
import riskAnaliziRoutes from './riskAnaliziRoutes.js';
import bildirimRoutes from './bildirimRoutes.js';
import whatIfRoutes from './whatIfRoutes.js';
import excelUploadRoutes from './excelUploadRoutes.js';
import stratejikAnalizRoutes from './stratejikAnalizRoutes.js';
import performansRaporlariRoutes from './performansRaporlariRoutes.js';
import veriKalitesiRoutes from './veriKalitesiRoutes.js';
import akademikTakvimRoutes from './akademikTakvimRoutes.js';
import milestoneRoutes from './milestoneRoutes.js';

const router = express.Router();

// Route'ları bağla
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ogrenci', ogrenciRoutes);
router.use('/akademik-personel', akademikPersonelRoutes);
router.use('/risk-analizi', riskAnaliziRoutes);
router.use('/bildirim', bildirimRoutes);
router.use('/what-if', whatIfRoutes);
router.use('/admin/excel-upload', excelUploadRoutes);
router.use('/stratejik-analiz', stratejikAnalizRoutes);
router.use('/performans-raporlari', performansRaporlariRoutes);
router.use('/veri-kalitesi', veriKalitesiRoutes);
router.use('/akademik-takvim', akademikTakvimRoutes);
router.use('/milestone', milestoneRoutes);

export default router;

