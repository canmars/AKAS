const { getStudentsList, getStudentDetails } = require('../models/studentModel');

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
            page = 1,
            limit = 20
        } = req.query;

        const filters = {
            search,
            program_id,
            risk_level,
            status,
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

module.exports = {
    listStudents,
    getStudentDetail
};

