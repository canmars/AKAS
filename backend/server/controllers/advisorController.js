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

/**
 * POST /api/advisors/assign
 * Öğrenciye Danışman Atama (CREATE Operation)
 */
const assignAdvisor = async (req, res) => {
    try {
        const { ogrenci_id, danisman_id } = req.body;

        // Validation
        if (!ogrenci_id || !danisman_id) {
            return res.status(400).json({
                success: false,
                error: 'Eksik parametre: ogrenci_id ve danisman_id gereklidir'
            });
        }

        // Model fonksiyonunu çağır (İş kuralları burada kontrol edilir)
        const result = await advisorModel.assignAdvisorToStudent(ogrenci_id, danisman_id);

        res.status(201).json({
            success: true,
            message: 'Danışman başarıyla atandı',
            data: result
        });

    } catch (error) {
        console.error('Error in assignAdvisor controller:', error);

        // İş kuralı ihlalleri için 400 Bad Request
        if (error.message.includes('kapasitesi dolu') ||
            error.message.includes('aktif değil') ||
            error.message.includes('zaten bir danışmanı var') ||
            error.message.includes('bulunamadı')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Diğer hatalar için 500 Internal Server Error
        res.status(500).json({
            success: false,
            error: 'Danışman atama sırasında bir hata oluştu',
            details: error.message
        });
    }
};

/**
 * PUT /api/advisors/change/:studentId
 * Öğrencinin Danışmanını Değiştirme (UPDATE Operation)
 */
const changeAdvisor = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { yeni_danisman_id, degisiklik_nedeni } = req.body;

        // Validation
        if (!studentId || !yeni_danisman_id) {
            return res.status(400).json({
                success: false,
                error: 'Eksik parametre: studentId ve yeni_danisman_id gereklidir'
            });
        }

        // Model fonksiyonunu çağır (İş kuralları burada kontrol edilir)
        const result = await advisorModel.changeStudentAdvisor(
            studentId,
            yeni_danisman_id,
            degisiklik_nedeni || 'Belirtilmemiş'
        );

        res.status(200).json({
            success: true,
            message: 'Danışman değişikliği başarılı',
            data: result
        });

    } catch (error) {
        console.error('Error in changeAdvisor controller:', error);

        // İş kuralı ihlalleri için 400 Bad Request
        if (error.message.includes('kapasitesi dolu') ||
            error.message.includes('aktif değil') ||
            error.message.includes('bulunamadı') ||
            error.message.includes('mevcut danışmanı yok') ||
            error.message.includes('aynı')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Diğer hatalar için 500 Internal Server Error
        res.status(500).json({
            success: false,
            error: 'Danışman değiştirme sırasında bir hata oluştu',
            details: error.message
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
    // CRUD Operations
    assignAdvisor,
    changeAdvisor,
};
