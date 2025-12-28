const courseModel = require('../models/courseModel');

const getCourseAnalysisData = async (req, res) => {
    try {
        const { yil = 2024, donem = 'Guz' } = req.query;

        const [kpis, distribution, repeated, details] = await Promise.all([
            courseModel.getCourseAnalysisKPIs(yil, donem),
            courseModel.getCourseGradeDistribution(yil, donem),
            courseModel.getMostRepeatedCourses(yil, donem),
            courseModel.getCourseSuccessDetails(yil, donem)
        ]);

        res.json({
            success: true,
            data: {
                kpis,
                distribution,
                repeated,
                details
            }
        });
    } catch (error) {
        console.error('Error in getCourseAnalysisData:', error);
        res.status(500).json({
            success: false,
            message: 'Ders analizi verileri alınırken bir hata oluştu.',
            error: error.message
        });
    }
};

const getCourseStudentsController = async (req, res) => {
    try {
        const { ders_kodu, yil, donem } = req.query;

        if (!ders_kodu || !yil || !donem) {
            return res.status(400).json({
                success: false,
                message: 'Eksik parametre: ders_kodu, yil ve donem gereklidir.'
            });
        }

        const students = await courseModel.getCourseStudents(ders_kodu, yil, donem);

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error in getCourseStudentsController:', error);
        res.status(500).json({
            success: false,
            message: 'Ders öğrencileri alınırken bir hata oluştu.',
            error: error.message
        });
    }
};

module.exports = {
    getCourseAnalysisData,
    getCourseStudentsController
};
