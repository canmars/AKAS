const supabase = require('../config/supabase');

const getCoursePerformance = async () => {
    try {
        // Hardcoded for '2024' and 'Guz' as requested
        const { data, error } = await supabase.rpc('get_donem_basarisi', { yil: 2024, donem: 'Guz' });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
};

const getCourseAnalysisKPIs = async (yil, donem) => {
    try {
        const { data, error } = await supabase.rpc('get_course_analysis_kpis', {
            p_yil: parseInt(yil),
            p_donem: donem
        });
        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
};

const getCourseGradeDistribution = async (yil, donem) => {
    try {
        const { data, error } = await supabase.rpc('get_course_grade_distribution_chart', {
            p_yil: parseInt(yil),
            p_donem: donem
        });
        if (error) throw error;
        return data || [];
    } catch (error) {
        throw error;
    }
};

const getMostRepeatedCourses = async (yil, donem) => {
    try {
        const { data, error } = await supabase.rpc('get_most_repeated_courses', {
            p_yil: parseInt(yil),
            p_donem: donem
        });
        if (error) throw error;
        return data || [];
    } catch (error) {
        throw error;
    }
};

const getCourseSuccessDetails = async (yil, donem) => {
    try {
        const { data, error } = await supabase.rpc('get_course_success_details', {
            p_yil: parseInt(yil),
            p_donem: donem
        });
        if (error) throw error;
        return data || [];
    } catch (error) {
        throw error;
    }
};

const getCourseStudents = async (courseCode, yil, donem) => {
    try {
        const { data, error } = await supabase.rpc('get_course_detail_students', {
            p_ders_kodu: courseCode,
            p_yil: parseInt(yil),
            p_donem: donem
        });
        if (error) throw error;
        return data || [];
    } catch (error) {
        throw error;
    }
};

const getCourseRiskMetrics = async () => {
    try {
        const { data, error } = await supabase.rpc('get_course_risk_metrics');

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching course risk metrics:', error);
        throw error;
    }
};

const getCourseFailureReport = async (courseCode) => {
    try {
        const { data, error } = await supabase.rpc('get_course_failure_report', {
            course_code_param: courseCode
        });

        if (error) throw error;
        return data || null;
    } catch (error) {
        console.error('Error fetching course failure report:', error.message);
        return null;
    }
};

module.exports = {
    getCoursePerformance,
    getCourseRiskMetrics,
    getCourseFailureReport,
    getCourseAnalysisKPIs,
    getCourseGradeDistribution,
    getMostRepeatedCourses,
    getCourseSuccessDetails,
    getCourseStudents
};
