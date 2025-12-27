const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

/**
 * Test Routes for Authentication & RBAC
 * 
 * Bu route'lar sadece test amaçlıdır.
 * Production'da silinebilir veya yorum satırı yapılabilir.
 */

// Public endpoint - herkes erişebilir
router.get('/public', (req, res) => {
    res.json({
        success: true,
        message: 'Bu public bir endpoint, herkes erişebilir'
    });
});

// Protected endpoint - sadece token ile erişilebilir
router.get('/protected', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token doğrulandı, korumalı endpoint\'e erişildi',
        user: req.user
    });
});

// Admin only endpoint - sadece Bolum_Baskani erişebilir
router.get('/admin-only', verifyToken, verifyRole('Bolum_Baskani'), (req, res) => {
    res.json({
        success: true,
        message: 'Sadece Bölüm Başkanı erişebilir',
        user: req.user
    });
});

// Advisor only endpoint - sadece Danisman erişebilir
router.get('/advisor-only', verifyToken, verifyRole('Danisman'), (req, res) => {
    res.json({
        success: true,
        message: 'Sadece Danışman erişebilir',
        user: req.user
    });
});

// Both roles endpoint - hem Bolum_Baskani hem Danisman erişebilir
router.get('/staff-only', verifyToken, verifyRole('Bolum_Baskani', 'Danisman'), (req, res) => {
    res.json({
        success: true,
        message: 'Akademik personel erişebilir',
        user: req.user
    });
});

module.exports = router;
