const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Authentication Routes
 * 
 * POST /api/auth/login - Kullanıcı girişi
 */

// Login endpoint
router.post('/login', authController.login);

module.exports = router;
