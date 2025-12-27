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

module.exports = router;
