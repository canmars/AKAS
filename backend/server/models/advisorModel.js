const supabase = require('../config/supabase');

const getAdvisorsWithLoad = async () => {
    try {
        const { data, error } = await supabase
            .from('akademik_personel')
            .select('ad, soyad, mevcut_danismanlik_sayisi')
            .or('rol.eq.Danisman,rol.eq.Bolum_Baskani')
            .order('mevcut_danismanlik_sayisi', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        throw error;
    }
};

const getAdvisorStudentsDetail = async (advisorId) => {
    try {
        const { data, error } = await supabase.rpc('get_advisor_students_detail', {
            advisor_id_param: advisorId
        });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching advisor students detail:", error.message);
        return [];
    }
};

/**
 * Danışman Analizi KPI'ları
 * @returns {Object} - KPI verileri
 */
const getAdvisorAnalysisKPIs = async () => {
    try {
        const { data, error } = await supabase.rpc('get_advisor_analysis_kpis', {});
        if (error) throw error;
        // Function returns JSON array, get first element
        const kpiData = Array.isArray(data) && data.length > 0 ? data[0] : data;
        return kpiData || {
            toplam_danisman: 0,
            gecen_donem_artis: 0,
            ortalama_doluluk: 0,
            ortalama_doluluk_artis: 0,
            aktif_ogrenci_toplam: 0,
            aktif_ogrenci_tezli: 0,
            aktif_ogrenci_tezsiz: 0,
            basari_orani: 0,
            basari_orani_artis: 0
        };
    } catch (error) {
        console.error("Error fetching advisor analysis KPIs:", error.message);
        throw error;
    }
};

/**
 * Uzmanlık Dağılımı
 * @param {String} filterCategory - Filtre kategorisi (Genel, Yapay Zeka, Veri Bilimi)
 * @returns {Array} - Uzmanlık dağılımı listesi
 */
const getExpertiseDistribution = async (filterCategory = null) => {
    try {
        const { data, error } = await supabase.rpc('get_advisor_expertise_distribution', {
            filter_category: filterCategory
        });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching expertise distribution:", error.message);
        throw error;
    }
};

/**
 * Tezli/Tezsiz Kota Karşılaştırması (Unvan Bazında)
 * @returns {Array} - Unvan bazında kota karşılaştırması
 */
const getQuotaComparison = async () => {
    try {
        const { data, error } = await supabase.rpc('get_advisor_quota_comparison', {});
        if (error) throw error;
        // Function returns JSON array, so data is already an array
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching quota comparison:", error.message);
        throw error;
    }
};

/**
 * Danışman Performans Listesi
 * @param {Object} params - { page, limit, unvan }
 * @returns {Object} - { data: [], meta: { total, page, limit, totalPages } }
 */
const getAdvisorPerformanceList = async (params = {}) => {
    try {
        const { page = 1, limit = 10, unvan = null } = params;
        const { data, error } = await supabase.rpc('get_advisor_performance_list', {
            page_num: page,
            page_size: limit,
            unvan_filter: unvan
        });
        
        if (error) throw error;
        
        const total = data?.[0]?.total_count || 0;
        const advisors = data || [];
        
        return {
            data: advisors,
            meta: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error fetching advisor performance list:", error.message);
        throw error;
    }
};

module.exports = {
    getAdvisorsWithLoad,
    getAdvisorStudentsDetail,
    getAdvisorAnalysisKPIs,
    getExpertiseDistribution,
    getQuotaComparison,
    getAdvisorPerformanceList,
};
