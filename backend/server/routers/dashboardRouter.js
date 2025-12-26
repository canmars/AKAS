const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/risky-students', dashboardController.getRiskyStudentsAnalytics);
router.get('/course-performance', dashboardController.getCourseAnalytics);
router.get('/risk-distribution', dashboardController.getRiskDistributionAnalytics);

router.get('/kpis', dashboardController.getKPIs);
router.get('/advisor-load', dashboardController.getAdvisorLoad);
router.get('/funnel', dashboardController.getFunnel);

module.exports = router;
