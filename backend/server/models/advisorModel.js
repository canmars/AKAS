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

// ====== DANISMAN ATAMA MODÜLܜ ======

/**
 * İş Kuralı 1: Danışman Yük Limiti Kontrolü
 * Danışmanın mevcut öğrenci sayısı maksimum kapasitesini aşmamalıdır
 * @param {String} advisorId - Danışman UUID
 * @returns {Object} - { hasCapacity: boolean, current: number, maximum: number, advisorName: string }
 */
const checkAdvisorCapacity = async (advisorId) => {
    try {
        const { data, error } = await supabase
            .from('akademik_personel')
            .select('mevcut_danismanlik_sayisi, maksimum_kapasite, unvan, ad, soyad')
            .eq('personel_id', advisorId)
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('Danışman bulunamadı');
        
        const hasCapacity = data.mevcut_danismanlik_sayisi < data.maksimum_kapasite;
        
        return {
            hasCapacity,
            current: data.mevcut_danismanlik_sayisi,
            maximum: data.maksimum_kapasite,
            advisorName: `${data.unvan} ${data.ad} ${data.soyad}`
        };
    } catch (error) {
        console.error("Error checking advisor capacity:", error.message);
        throw error;
    }
};

/**
 * İş Kuralı 2: Aktif Danışman Kontrolü
 * Sadece aktif danışmanlar öğrencilere atanabilir
 * @param {String} advisorId - Danışman UUID
 * @returns {Object} - { isActive: boolean, advisorName: string }
 */
const checkAdvisorStatus = async (advisorId) => {
    try {
        const { data, error } = await supabase
            .from('akademik_personel')
            .select('aktif_danisman_mi, aktif_mi, unvan, ad, soyad')
            .eq('personel_id', advisorId)
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('Danışman bulunamadı');
        
        const isActive = data.aktif_danisman_mi === true && data.aktif_mi === true;
        
        return {
            isActive,
            advisorName: `${data.unvan} ${data.ad} ${data.soyad}`
        };
    } catch (error) {
        console.error("Error checking advisor status:", error.message);
        throw error;
    }
};

/**
 * Danışman sayacını artır
 * @param {String} advisorId - Danışman UUID
 * @returns {Boolean} - Success status
 */
const incrementAdvisorCount = async (advisorId) => {
    try {
        const { error } = await supabase.rpc('increment_advisor_count', {
            advisor_id_param: advisorId
        });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error incrementing advisor count:", error.message);
        throw error;
    }
};

/**
 * Danışman sayacını azalt
 * @param {String} advisorId - Danışman UUID
 * @returns {Boolean} - Success status
 */
const decrementAdvisorCount = async (advisorId) => {
    try {
        const { error } = await supabase.rpc('decrement_advisor_count', {
            advisor_id_param: advisorId
        });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error decrementing advisor count:", error.message);
        throw error;
    }
};

/**
 * Öğrenciye Danışman Atama (CREATE Operation)
 * @param {String} studentId - Öğrenci UUID
 * @param {String} advisorId - Danışman UUID
 * @returns {Object} - Atama bilgileri
 */
const assignAdvisorToStudent = async (studentId, advisorId) => {
    try {
        // 1. İş Kuralı Kontrolleri
        const capacityCheck = await checkAdvisorCapacity(advisorId);
        if (!capacityCheck.hasCapacity) {
            throw new Error(`Danışman kapasitesi dolu. Maksimum: ${capacityCheck.maximum}, Mevcut: ${capacityCheck.current}`);
        }
        
        const statusCheck = await checkAdvisorStatus(advisorId);
        if (!statusCheck.isActive) {
            throw new Error('Seçilen danışman aktif değil ve atama yapılamaz');
        }
        
        // 2. Öğrenci kontrolü (zaten danışmanı var mı?)
        const { data: studentData, error: studentError } = await supabase
            .from('ogrenci')
            .select('danisman_id, ad, soyad')
            .eq('ogrenci_id', studentId)
            .single();
        
        if (studentError) throw studentError;
        if (!studentData) throw new Error('Öğrenci bulunamadı');
        
        if (studentData.danisman_id) {
            throw new Error('Bu öğrencinin zaten bir danışmanı var. Değiştirmek için change endpoint\'ini kullanın.');
        }
        
        // 3. Danışman atama
        const { error: updateError } = await supabase
            .from('ogrenci')
            .update({ danisman_id: advisorId })
            .eq('ogrenci_id', studentId);
        
        if (updateError) throw updateError;
        
        // 4. Danışman geçmişine kaydet
        const { error: historyError } = await supabase
            .from('danisman_gecmisi')
            .insert({
                ogrenci_id: studentId,
                danisman_id: advisorId,
                atama_tarihi: new Date().toISOString().split('T')[0],
                aktif_mi: true
            });
        
        if (historyError) throw historyError;
        
        // 5. Danışman sayacını artır
        await incrementAdvisorCount(advisorId);
        
        return {
            ogrenci_id: studentId,
            danisman_id: advisorId,
            ogrenci_ad_soyad: `${studentData.ad} ${studentData.soyad}`,
            danisman_ad_soyad: statusCheck.advisorName,
            atama_tarihi: new Date().toISOString().split('T')[0]
        };
        
    } catch (error) {
        console.error("Error assigning advisor to student:", error.message);
        throw error;
    }
};

/**
 * Öğrencinin Danışmanını Değiştirme (UPDATE Operation)
 * @param {String} studentId - Öğrenci UUID
 * @param {String} newAdvisorId - Yeni Danışman UUID
 * @param {String} changeReason - Değişiklik nedeni
 * @returns {Object} - Değişiklik bilgileri
 */
const changeStudentAdvisor = async (studentId, newAdvisorId, changeReason = 'Belirtilmemiş') => {
    try {
        // 1. Yeni danışman için iş kuralı kontrolleri
        const capacityCheck = await checkAdvisorCapacity(newAdvisorId);
        if (!capacityCheck.hasCapacity) {
            throw new Error(`Yeni danışman kapasitesi dolu. Maksimum: ${capacityCheck.maximum}, Mevcut: ${capacityCheck.current}`);
        }
        
        const statusCheck = await checkAdvisorStatus(newAdvisorId);
        if (!statusCheck.isActive) {
            throw new Error('Seçilen yeni danışman aktif değil ve atama yapılamaz');
        }
        
        // 2. Öğrencinin mevcut danışmanını al
        const { data: studentData, error: studentError } = await supabase
            .from('ogrenci')
            .select('danisman_id, ad, soyad')
            .eq('ogrenci_id', studentId)
            .single();
        
        if (studentError) throw studentError;
        if (!studentData) throw new Error('Öğrenci bulunamadı');
        if (!studentData.danisman_id) throw new Error('Öğrencinin mevcut danışmanı yok');
        
        const oldAdvisorId = studentData.danisman_id;
        
        if (oldAdvisorId === newAdvisorId) {
            throw new Error('Yeni danışman mevcut danışman ile aynı');
        }
        
        // 3. Eski danışman bilgisini al
        const { data: oldAdvisorData } = await supabase
            .from('akademik_personel')
            .select('unvan, ad, soyad')
            .eq('personel_id', oldAdvisorId)
            .single();
        
        // 4. Öğrenci tablosunu güncelle
        const { error: updateError } = await supabase
            .from('ogrenci')
            .update({ danisman_id: newAdvisorId })
            .eq('ogrenci_id', studentId);
        
        if (updateError) throw updateError;
        
        // 5. Eski danışman geçmişini pasif yap
        const { error: deactivateError } = await supabase
            .from('danisman_gecmisi')
            .update({
                aktif_mi: false,
                ayrilma_tarihi: new Date().toISOString().split('T')[0]
            })
            .eq('ogrenci_id', studentId)
            .eq('aktif_mi', true);
        
        if (deactivateError) throw deactivateError;
        
        // 6. Yeni danışman geçmişi kaydı ekle
        const { error: historyError } = await supabase
            .from('danisman_gecmisi')
            .insert({
                ogrenci_id: studentId,
                danisman_id: newAdvisorId,
                atama_tarihi: new Date().toISOString().split('T')[0],
                aktif_mi: true,
                degisiklik_nedeni: changeReason
            });
        
        if (historyError) throw historyError;
        
        // 7. Danışman sayaçlarını güncelle (eski -1, yeni +1)
        await decrementAdvisorCount(oldAdvisorId);
        await incrementAdvisorCount(newAdvisorId);
        
        return {
            ogrenci_id: studentId,
            ogrenci_ad_soyad: `${studentData.ad} ${studentData.soyad}`,
            eski_danisman_id: oldAdvisorId,
            eski_danisman_ad_soyad: oldAdvisorData ? `${oldAdvisorData.unvan} ${oldAdvisorData.ad} ${oldAdvisorData.soyad}` : 'Bilinmiyor',
            yeni_danisman_id: newAdvisorId,
            yeni_danisman_ad_soyad: statusCheck.advisorName,
            degisiklik_tarihi: new Date().toISOString().split('T')[0],
            degisiklik_nedeni: changeReason
        };
        
    } catch (error) {
        console.error("Error changing student advisor:", error.message);
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
    // CRUD Operations
    assignAdvisorToStudent,
    changeStudentAdvisor,
    checkAdvisorCapacity,
    checkAdvisorStatus,
    incrementAdvisorCount,
    decrementAdvisorCount,
};
