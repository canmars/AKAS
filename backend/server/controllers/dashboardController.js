const studentModel = require('../models/studentModel');
const courseModel = require('../models/courseModel');
const thesisModel = require('../models/thesisModel');
const advisorModel = require('../models/advisorModel');

const getRiskyStudentsAnalytics = async (req, res) => {
    try {
        const data = await studentModel.getRiskyStudents();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching risky students:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const getCourseAnalytics = async (req, res) => {
    try {
        const data = await courseModel.getCoursePerformance();

        // Sort by Average Grade ASC and take top 10
        const sortedData = data
            .sort((a, b) => parseFloat(a.ders_ortalamasi) - parseFloat(b.ders_ortalamasi))
            .slice(0, 10);

        res.status(200).json(sortedData);
    } catch (error) {
        console.error('Error fetching course performance:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const getFunnelStats = async (req, res) => {
    try {
        const data = await thesisModel.getThesisFunnelStats();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching funnel stats:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const getRiskDistributionAnalytics = async (req, res) => {
    try {
        const data = await studentModel.getRiskDistribution();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching risk distribution:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const getKPIs = async (req, res) => {
    try {
        const data = await studentModel.getDashboardKPIsV2();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching dashboard KPIs:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAdvisorLoad = async (req, res) => {
    try {
        const data = await studentModel.getAdvisorLoadMetrics();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFunnel = async (req, res) => {
    try {
        const data = await studentModel.getFunnelStatsV2();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCriticalAlarms = async (req, res) => {
    try {
        const data = await studentModel.getCriticalAlarms();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStudentsByStage = async (req, res) => {
    try {
        const { stage } = req.query;

        if (!stage) {
            return res.status(400).json({ error: 'Stage parameter is required' });
        }

        const data = await studentModel.getStudentsByStage(stage);
        res.json(data);
    } catch (error) {
        console.error('Error fetching students by stage:', error);
        res.status(500).json({ error: error.message });
    }
};

const getCourseRiskMetrics = async (req, res) => {
    try {
        const data = await courseModel.getCourseRiskMetrics();
        res.json(data);
    } catch (error) {
        console.error('Error fetching course risk metrics:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// DETAY MODAL ENDPOINT'LERİ
// ============================================

const getRiskyStudentsDetail = async (req, res) => {
    try {
        const data = await studentModel.getRiskyStudentsDetail();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdvisorStudentsDetail = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Advisor ID is required' });
        }
        const data = await advisorModel.getAdvisorStudentsDetail(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCourseFailureReport = async (req, res) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(400).json({ error: 'Course code is required' });
        }
        const data = await courseModel.getCourseFailureReport(code);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getActiveThesesDetail = async (req, res) => {
    try {
        const data = await thesisModel.getActiveThesesDetail();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getRiskyStudentsAnalytics, // Kept original as no definition for getRiskyStudentsList was provided
    getCourseAnalytics,        // Kept original as no definition for getCoursePerformanceAnalytics was provided
    getFunnelStats,            // Kept original as no definition for getFunnelStats was provided
    getRiskDistributionAnalytics,
    getKPIs,
    getAdvisorLoad,
    getFunnel,
    getCriticalAlarms,
    getStudentsByStage,
    getCourseRiskMetrics,
    getRiskyStudentsDetail,
    getAdvisorStudentsDetail,
    getCourseFailureReport,
    getActiveThesesDetail
};
