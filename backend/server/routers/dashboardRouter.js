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

// Kritik alarmlar (YENİ ALIAS)
router.get('/alarms',
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

// Funnel aşamasına göre öğrenci listesi
router.get('/funnel/students',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getStudentsByStage
);

// Ders Risk Analizi (Ders başarısızlık ve risk metrikleri)
router.get('/course-risk',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getCourseRiskMetrics
);

// ============================================
// DETAY MODAL ENDPOINT'LERİ
// ============================================

// Riskli öğrenciler detay listesi
router.get('/details/risky-students',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getRiskyStudentsDetail
);

// Danışman öğrenci listesi (Ders/Tez aşaması ayrımıyla)
router.get('/details/advisor/:id',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getAdvisorStudentsDetail
);

// Ders başarısızlık karnesi
router.get('/details/course/:code',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getCourseFailureReport
);

// Aktif tezler detay listesi
router.get('/details/active-theses',
    verifyToken,
    authorizeRoles('Bolum_Baskani'),
    dashboardController.getActiveThesesDetail
);

// ============================================
// HEM BAŞKAN HEM DANIŞMAN ERİŞEBİLİR
// ============================================
// Not: Şu an tüm endpoint'ler bölüm geneli olduğu için
// danışmana özel endpoint'ler ayrı oluşturulmalı.
// Örnek: /api/students/my-list gibi

module.exports = router;

