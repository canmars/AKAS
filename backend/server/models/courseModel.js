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
};
