const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * ADVISOR ROUTES - ROLE-BASED ACCESS CONTROL
 * 
 * Danışman yük dağılımı sadece Bölüm Başkanı görebilir.
 */

// Danışman yük dağılımı (Tüm hocaların öğrenci sayıları)
router.get('/load-distribution',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    advisorController.getAdvisorLoadDistribution
);

/**
 * @route   GET /api/advisors/kpis
 * @desc    Danışman Analizi KPI'ları
 * @access  Private
 */
router.get('/kpis', verifyToken, advisorController.getAdvisorKPIs);

/**
 * @route   GET /api/advisors/expertise
 * @desc    Uzmanlık Dağılımı
 * @access  Private
 * @query   { category: string } - Filtre kategorisi (Genel, Yapay Zeka, Veri Bilimi)
 */
router.get('/expertise', verifyToken, advisorController.getExpertiseDistribution);

/**
 * @route   GET /api/advisors/quota-comparison
 * @desc    Tezli/Tezsiz Kota Karşılaştırması (Unvan Bazında)
 * @access  Private
 */
router.get('/quota-comparison', verifyToken, advisorController.getQuotaComparison);

/**
 * @route   GET /api/advisors/performance
 * @desc    Danışman Performans Listesi
 * @access  Private
 * @query   { page: number, limit: number, unvan: string }
 */
router.get('/performance', verifyToken, advisorController.getAdvisorPerformance);

/**
 * @route   GET /api/advisors/:id/students
 * @desc    Danışman Öğrenci Listesi
 * @access  Private
 */
router.get('/:id/students', verifyToken, advisorController.getAdvisorStudents);

module.exports = router;
