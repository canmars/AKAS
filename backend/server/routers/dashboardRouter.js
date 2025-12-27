const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * DASHBOARD ROUTES - ROLE-BASED ACCESS CONTROL
 * 
 * Bölüm Başkanı (Bolum_Baskani): Tüm bölüm genelindeki istatistikleri görebilir
 * Danışman (Danisman): Sadece kendi öğrencileriyle ilgili verileri görebilir
 */

// ============================================
// SADECE BÖLÜM BAŞKANI ERİŞEBİLİR
// ============================================

// Tüm bölüm KPI özeti (Genel istatistikler)
router.get('/kpis',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getKPIs
);

// Hocaların yük dağılımı (Danışman sayıları, kotalar)
router.get('/advisor-load',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getAdvisorLoad
);

// Akademik süreç hunisi (Tüm öğrencilerin aşama dağılımı)
router.get('/funnel',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getFunnel
);

// Kritik alarmlar (Tüm bölüm geneli uyarılar)
router.get('/critical-alarms',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getCriticalAlarms
);

// Risk dağılımı (Tüm öğrencilerin risk seviyeleri)
router.get('/risk-distribution',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getRiskDistributionAnalytics
);

// Riskli öğrenciler analizi (Detaylı risk raporu)
router.get('/risky-students',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getRiskyStudentsAnalytics
);

// Ders performans analizi (Tüm bölüm ders başarı oranları)
router.get('/course-performance',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getCourseAnalytics
);

// ============================================
// HEM BAŞKAN HEM DANIŞMAN ERİŞEBİLİR
// ============================================
// Not: Şu an tüm endpoint'ler bölüm geneli olduğu için
// danışmana özel endpoint'ler ayrı oluşturulmalı.
// Örnek: /api/students/my-list gibi

module.exports = router;

