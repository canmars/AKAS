const express = require('express');
const router = express.Router();
const {
    listStudents,
    getStudentDetail,
    getStudentStats,
    getPrograms,
    getStages,
    getAllStudentsDetail,
    getThesisStageDetail,
    getMonitoringDetail,
    getHighRiskDetail,
    getStudentKPIsV2,
    getProgramDistribution,
    getStageDistribution,
    getProgramDistributionDetail,
    getStageDistributionDetail
} = require('../controllers/studentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tüm student route'ları authentication gerektiriyor
router.use(verifyToken);

/**
 * @route   GET /api/students/stats
 * @desc    Öğrenci Analizi İstatistikleri
 * @access  Private
 */
router.get('/stats', getStudentStats);

/**
 * @route   GET /api/students/programs
 * @desc    Program Listesi
 * @access  Private
 */
router.get('/programs', getPrograms);

/**
 * @route   GET /api/students/stages
 * @desc    Aşama Listesi
 * @access  Private
 */
router.get('/stages', getStages);

/**
 * @route   GET /api/students/stats/all
 * @desc    Tüm Öğrenciler Detayı
 * @access  Private
 * @query   { page: number, limit: number }
 */
router.get('/stats/all', getAllStudentsDetail);

/**
 * @route   GET /api/students/stats/thesis
 * @desc    Tez Aşamasındaki Öğrenciler Detayı
 * @access  Private
 * @query   { page: number, limit: number }
 */
router.get('/stats/thesis', getThesisStageDetail);

/**
 * @route   GET /api/students/stats/monitoring
 * @desc    İzlenmesi Gereken Öğrenciler Detayı
 * @access  Private
 * @query   { page: number, limit: number }
 */
router.get('/stats/monitoring', getMonitoringDetail);

/**
 * @route   GET /api/students/stats/high-risk
 * @desc    Yüksek Riskli Öğrenciler Detayı
 * @access  Private
 * @query   { page: number, limit: number }
 */
router.get('/stats/high-risk', getHighRiskDetail);

/**
 * @route   GET /api/students/stats/v2
 * @desc    Öğrenci Analizi KPI'ları V2 (Yeni KPI'lar)
 * @access  Private
 */
router.get('/stats/v2', getStudentKPIsV2);

/**
 * @route   GET /api/students/program-distribution
 * @desc    Program Dağılımı (Lisans, Yüksek Lisans, Doktora)
 * @access  Private
 */
router.get('/program-distribution', getProgramDistribution);

/**
 * @route   GET /api/students/stage-distribution
 * @desc    Aşama Dağılımı (Hazırlık, Ders, Yeterlilik, Tez)
 * @access  Private
 */
router.get('/stage-distribution', getStageDistribution);

/**
 * @route   GET /api/students/program-distribution/:type
 * @desc    Program Dağılımı Detayı (Lisans, Yüksek Lisans, Doktora)
 * @access  Private
 * @param   {string} type - Program tipi (Lisans, Yüksek Lisans, Doktora)
 * @query   { page: number, limit: number }
 */
router.get('/program-distribution/:type', getProgramDistributionDetail);

/**
 * @route   GET /api/students/stage-distribution/:code
 * @desc    Aşama Dağılımı Detayı
 * @access  Private
 * @param   {string} code - Durum kodu (DERS_ASAMASI, TEZ_ASAMASI, YETERLIK, HAZIRLIK)
 * @query   { page: number, limit: number }
 */
router.get('/stage-distribution/:code', getStageDistributionDetail);

/**
 * @route   GET /api/students
 * @desc    Öğrenci Listesi (Pagination + Filtering)
 * @access  Private
 * @query   {
 *   search: string,       // Ad, Soyad, veya Öğrenci No
 *   program_id: uuid,     // Program ID filtresi
 *   risk_level: string,   // 'Kritik' | 'Yuksek' | 'Orta' | 'Dusuk'
 *   status: string,       // 'Aktif' | 'Pasif' | 'Dondurulmus' | 'Mezun'
 *   stage: string,        // Aşama adı (örn: 'Ders Aşamasında', 'Tez Aşamasında')
 *   page: number,         // Sayfa numarası (default: 1)
 *   limit: number         // Sayfa başına kayıt (default: 20)
 * }
 */
router.get('/', listStudents);

/**
 * @route   GET /api/students/:id/details
 * @desc    Öğrenci Detaylı Bilgisi
 * @access  Private
 * @param   {uuid} id - Öğrenci ID
 */
router.get('/:id/details', getStudentDetail);

module.exports = router;

