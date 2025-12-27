const supabase = require('../config/supabase');

// Helper for retry logic
const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        console.warn(`Retrying Supabase operation... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2);
    }
};

const getRiskyStudents = async () => {
    try {
        // 1. Get base risky students from RPC with Retry
        const { data: riskyStudents, error: rpcError } = await fetchWithRetry(() =>
            supabase.rpc('get_riskli_ogrenciler')
        );

        if (rpcError) {
            throw rpcError;
        }

        if (!riskyStudents || riskyStudents.length === 0) {
            return [];
        }

        // 2. Extract IDs for secondary query
        const studentIds = riskyStudents.map(s => s.ogrenci_id);

        // 3. Fetch program info from 'ogrenci' -> 'program_turleri' with Retry
        const { data: programData, error: programError } = await fetchWithRetry(() =>
            supabase
                .from('ogrenci')
                .select('ogrenci_id, program_turleri (program_adi)')
                .in('ogrenci_id', studentIds)
        );

        if (programError) {
            console.error('Error fetching programs:', programError);
            // Return base data if secondary fetch fails, rather than crashing
            return riskyStudents;
        }

        // 4. Merge program_adi into riskyStudents
        // Create a lookup map for faster access
        const programMap = {};
        if (programData) {
            programData.forEach(p => {
                if (p.program_turleri && p.program_turleri.program_adi) {
                    programMap[p.ogrenci_id] = p.program_turleri.program_adi;
                }
            });
        }

        // Combine
        const enrichedData = riskyStudents.map(student => ({
            ...student,
            program_adi: programMap[student.ogrenci_id] || 'Bilinmiyor'
        }));

        return enrichedData;

    } catch (error) {
        console.error("Error fetching risky students:", error.message);
        throw error;
    }
};

const getRiskDistribution = async () => {
    try {
        // Fetch GNO for all students to calculate distribution
        // Using fetchWithRetry for stability
        const { data: students, error } = await fetchWithRetry(() =>
            supabase
                .from('ogrenci')
                .select('gno')
        );

        if (error) throw error;

        let stats = { high: 0, medium: 0, low: 0 };

        if (students) {
            students.forEach(s => {
                const gno = parseFloat(s.gno);
                if (!isNaN(gno)) {
                    if (gno < 2.0) {
                        stats.high++;
                    } else if (gno >= 2.0 && gno < 2.5) {
                        stats.medium++;
                    } else {
                        stats.low++;
                    }
                }
            });
        }

        return stats;

    } catch (error) {
        console.error("Error calculating risk distribution:", error.message);
        // Fallback to 0 if error, to prevent dashboard crash
        return { high: 0, medium: 0, low: 0 };
    }
};

const getDashboardKPIs = async () => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_kpis');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching dashboard KPIs:", error.message);
        return null;
    }
};

const getAdvisorLoadMetrics = async () => {
    try {
        const { data, error } = await supabase.rpc('get_advisor_load_metrics');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching advisor load metrics:', error.message);
        return [];
    }
};

const getFunnelMetrics = async () => {
    try {
        const { data, error } = await supabase.rpc('get_funnel_metrics');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching funnel metrics:', error.message);
        return null;
    }
};

const getDashboardKPIsV2 = async () => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_kpis_v2');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching dashboard KPIs v2:", error.message);
        return null;
    }
};

const getFunnelStatsV2 = async () => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_funnel_stats');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching funnel stats v2:", error.message);
        return [];
    }
};

const getCriticalAlarms = async () => {
    try {
        const { data, error } = await supabase.rpc('get_critical_student_alarms');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching critical alarms:", error.message);
        return [];
    }
};

module.exports = {
    getRiskyStudents,
    getRiskDistribution,
    getDashboardKPIs,
    getAdvisorLoadMetrics,
    getFunnelMetrics,
    getDashboardKPIsV2,
    getFunnelStatsV2,
    getCriticalAlarms
};
