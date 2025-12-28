const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Get all course analysis data for a specific term
router.get('/analysis', courseController.getCourseAnalysisData);

// Get students for a specific course
router.get('/students', courseController.getCourseStudentsController);

module.exports = router;
