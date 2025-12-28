const express = require('express');
const router = express.Router();
const { listStudents, getStudentDetail } = require('../controllers/studentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tüm student route'ları authentication gerektiriyor
router.use(verifyToken);

/**
 * @route   GET /api/students
 * @desc    Öğrenci Listesi (Pagination + Filtering)
 * @access  Private
 * @query   {
 *   search: string,       // Ad, Soyad, veya Öğrenci No
 *   program_id: uuid,     // Program ID filtresi
 *   risk_level: string,   // 'Kritik' | 'Yuksek' | 'Orta' | 'Dusuk'
 *   status: string,       // 'Aktif' | 'Pasif' | 'Dondurulmus' | 'Mezun'
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

