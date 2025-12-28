const {
    getStudentsList,
    getStudentDetails,
    getStudentAnalysisStats,
    getProgramsList,
    getStagesList,
    getAllStudentsDetail,
    getThesisStageStudentsDetail,
    getMonitoringStudentsDetail,
    getHighRiskStudentsDetail,
    getStudentAnalysisKPIsV2,
    getProgramDistribution,
    getStageDistribution,
    getProgramDistributionDetail,
    getStageDistributionDetail
} = require('../models/studentModel');

/**
 * GET /api/students
 * Öğrenci Listesi (Pagination + Filtering)
 */
const listStudents = async (req, res) => {
    try {
        const {
            search,
            program_id,
            risk_level,
            status,
            stage,
            page = 1,
            limit = 20
        } = req.query;

        const filters = {
            search,
            program_id,
            risk_level,
            status,
            stage,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await getStudentsList(filters);

        res.json(result);
    } catch (error) {
        console.error('Error in listStudents controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/:id/details
 * Öğrenci Detay Bilgisi
 */
const getStudentDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Student ID is required'
            });
        }

        const studentDetails = await getStudentDetails(id);

        res.json(studentDetails);
    } catch (error) {
        console.error('Error in getStudentDetail controller:', error);

        if (error.message === 'Student not found') {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Student not found'
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stats
 * Öğrenci Analizi İstatistikleri
 */
const getStudentStats = async (req, res) => {
    try {
        const stats = await getStudentAnalysisStats();
        res.json(stats);
    } catch (error) {
        console.error('Error in getStudentStats controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/programs
 * Program Listesi
 */
const getPrograms = async (req, res) => {
    try {
        const programs = await getProgramsList();
        res.json(programs);
    } catch (error) {
        console.error('Error in getPrograms controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stages
 * Aşama Listesi
 */
const getStages = async (req, res) => {
    try {
        const stages = await getStagesList();
        res.json(stages);
    } catch (error) {
        console.error('Error in getStages controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stats/all
 * Tüm Öğrenciler Detayı
 */
const getAllStudentsDetailController = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await getAllStudentsDetail({ page: parseInt(page), limit: parseInt(limit) });
        res.json(result);
    } catch (error) {
        console.error('Error in getAllStudentsDetail controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stats/thesis
 * Tez Aşamasındaki Öğrenciler Detayı
 */
const getThesisStageDetailController = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await getThesisStageStudentsDetail({ page: parseInt(page), limit: parseInt(limit) });
        res.json(result);
    } catch (error) {
        console.error('Error in getThesisStageDetail controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stats/monitoring
 * İzlenmesi Gereken Öğrenciler Detayı
 */
const getMonitoringDetailController = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await getMonitoringStudentsDetail({ page: parseInt(page), limit: parseInt(limit) });
        res.json(result);
    } catch (error) {
        console.error('Error in getMonitoringDetail controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stats/high-risk
 * Yüksek Riskli Öğrenciler Detayı
 */
const getHighRiskDetailController = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await getHighRiskStudentsDetail({ page: parseInt(page), limit: parseInt(limit) });
        res.json(result);
    } catch (error) {
        console.error('Error in getHighRiskDetail controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stats/v2
 * Öğrenci Analizi KPI'ları V2 (Yeni KPI'lar)
 */
const getStudentKPIsV2 = async (req, res) => {
    try {
        const kpis = await getStudentAnalysisKPIsV2();
        res.json(kpis);
    } catch (error) {
        console.error('Error in getStudentKPIsV2 controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/program-distribution
 * Program Dağılımı
 */
const getProgramDistributionController = async (req, res) => {
    try {
        const distribution = await getProgramDistribution();
        res.json(distribution);
    } catch (error) {
        console.error('Error in getProgramDistribution controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stage-distribution
 * Aşama Dağılımı
 */
const getStageDistributionController = async (req, res) => {
    try {
        const distribution = await getStageDistribution();
        res.json(distribution);
    } catch (error) {
        console.error('Error in getStageDistribution controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/program-distribution/:type
 * Program Dağılımı Detayı
 */
const getProgramDistributionDetailController = async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!type) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Program type is required'
            });
        }

        const result = await getProgramDistributionDetail({
            program_tipi: type,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        res.json(result);
    } catch (error) {
        console.error('Error in getProgramDistributionDetail controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * GET /api/students/stage-distribution/:code
 * Aşama Dağılımı Detayı
 */
const getStageDistributionDetailController = async (req, res) => {
    try {
        const { code } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!code) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Stage code is required'
            });
        }

        const result = await getStageDistributionDetail({
            durum_kodu: code,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        res.json(result);
    } catch (error) {
        console.error('Error in getStageDistributionDetail controller:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = {
    listStudents,
    getStudentDetail,
    getStudentStats,
    getPrograms,
    getStages,
    getAllStudentsDetail: getAllStudentsDetailController,
    getThesisStageDetail: getThesisStageDetailController,
    getMonitoringDetail: getMonitoringDetailController,
    getHighRiskDetail: getHighRiskDetailController,
    getStudentKPIsV2,
    getProgramDistribution: getProgramDistributionController,
    getStageDistribution: getStageDistributionController,
    getProgramDistributionDetail: getProgramDistributionDetailController,
    getStageDistributionDetail: getStageDistributionDetailController
};

