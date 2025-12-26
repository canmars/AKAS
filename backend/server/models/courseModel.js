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

module.exports = {
    getCoursePerformance,
};
