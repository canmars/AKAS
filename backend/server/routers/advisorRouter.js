const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');

router.get('/load-distribution', advisorController.getAdvisorLoadDistribution);

module.exports = router;
