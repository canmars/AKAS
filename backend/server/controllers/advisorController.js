const advisorModel = require('../models/advisorModel');

const getAdvisorLoadDistribution = async (req, res) => {
    try {
        const data = await advisorModel.getAdvisorsWithLoad();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching advisor load:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

/**
 * GET /api/advisors/kpis
 * Danışman Analizi KPI'ları
 */
const getAdvisorKPIs = async (req, res) => {
    try {
        const kpis = await advisorModel.getAdvisorAnalysisKPIs();
        res.json(kpis);
    } catch (error) {
        console.error('Error in getAdvisorKPIs controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/advisors/expertise
 * Uzmanlık Dağılımı
 */
const getExpertiseDistribution = async (req, res) => {
    try {
        const { category } = req.query;
        const data = await advisorModel.getExpertiseDistribution(category || null);
        res.json(data);
    } catch (error) {
        console.error('Error in getExpertiseDistribution controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/advisors/quota-comparison
 * Tezli/Tezsiz Kota Karşılaştırması
 */
const getQuotaComparison = async (req, res) => {
    try {
        const data = await advisorModel.getQuotaComparison();
        res.json(data);
    } catch (error) {
        console.error('Error in getQuotaComparison controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/advisors/performance
 * Danışman Performans Listesi
 */
const getAdvisorPerformance = async (req, res) => {
    try {
        const { page = 1, limit = 10, unvan } = req.query;
        const result = await advisorModel.getAdvisorPerformanceList({
            page: parseInt(page),
            limit: parseInt(limit),
            unvan: unvan || null
        });
        res.json(result);
    } catch (error) {
        console.error('Error in getAdvisorPerformance controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/advisors/:id/students
 * Danışman Öğrenci Listesi
 */
const getAdvisorStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const students = await advisorModel.getAdvisorStudentsDetail(id);
        res.json(students);
    } catch (error) {
        console.error('Error in getAdvisorStudents controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = {
    getAdvisorLoadDistribution,
    getAdvisorKPIs,
    getExpertiseDistribution,
    getQuotaComparison,
    getAdvisorPerformance,
    getAdvisorStudents,
};
