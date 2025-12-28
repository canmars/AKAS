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
        const { data, error } = await supabase.rpc('get_risk_distribution_stats');

        if (error) throw error;

        // If data is null/empty for some reason, return defaults
        if (!data) return { high: 0, medium: 0, low: 0, total: 0 };

        return data;
    } catch (error) {
        console.error("Error fetching risk distribution:", error.message);
        return { high: 0, medium: 0, low: 0, total: 0 };
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
        // Using the new detailed distribution function as requested
        const { data, error } = await supabase.rpc('get_advisor_workload_distribution');

        if (error) throw error;

        return data || [];
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
        const { data, error } = await supabase.rpc('get_dashboard_kpis_v3');
        if (error) throw error;
        return data;
    } catch (error) {
        throw new Error('Error fetching dashboard KPIs v3: ' + error.message);
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
        const { data, error } = await supabase
            .from('view_kritik_alarmlar')
            .select('*')
            .limit(20);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching critical alarms from view:", error.message);
        return [];
    }
};

const getStudentsByStage = async (stageName) => {
    try {
        // Aşama adına göre öğrencileri getir
        const { data, error } = await supabase.rpc('get_students_by_stage', {
            stage_name: stageName
        });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching students by stage:", error.message);
        return [];
    }
};

const getRiskyStudentsDetail = async () => {
    try {
        const { data, error } = await supabase.rpc('get_risky_students_detail');
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error fetching risky students detail:", error.message);
        return [];
    }
};

// ====== ÖĞRENCI ANALİZİ MOD ÜLÜ API'LERİ ======

/**
 * Öğrenci Listeleme (Pagination + Filtering)
 * @param {Object} filters - { search, program_id, risk_level, status, page, limit }
 * @returns {Object} - { data: [], meta: { total, page, limit } }
 */
const getStudentsList = async (filters = {}) => {
    try {
        const {
            search = '',
            program_id = null,
            risk_level = null,
            status = null,
            page = 1,
            limit = 20
        } = filters;

        // Calculate pagination
        const offset = (page - 1) * limit;

        // Base query
        let query = supabase
            .from('ogrenci')
            .select(`
                ogrenci_id,
                ogrenci_no,
                ad,
                soyad,
                program_turu_id,
                gno,
                aktif_mi,
                durum_id,
                danisman_id,
                program_turleri (
                    program_adi
                ),
                akademik_personel!ogrenci_danisman_id_fkey (
                    unvan,
                    ad,
                    soyad
                ),
                ogrenci_risk_skorlari (
                    risk_skoru,
                    risk_seviyesi
                ),
                ogrenci_akademik_durum (
                    mevcut_yariyil,
                    ders_tamamlandi_mi
                ),
                durum_turleri (
                    durum_adi
                )
            `, { count: 'exact' });

        // Filters
        if (search) {
            query = query.or(`ad.ilike.%${search}%,soyad.ilike.%${search}%,ogrenci_no.ilike.%${search}%`);
        }

        if (program_id) {
            query = query.eq('program_turu_id', program_id);
        }

        if (status) {
            if (status === 'Aktif') {
                query = query.eq('aktif_mi', true);
            }
            // For other statuses, we'll filter after fetching since durum_adi comes from related table
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        console.log('[DEBUG] Executing student list query...', { page, limit, offset });
        const { data, error, count } = await query;
        console.log('[DEBUG] Query result:', { dataCount: data?.length, error, totalCount: count });

        if (error) throw error;

        // Transform data
        const transformedData = (data || []).map(student => {
            const riskData = student.ogrenci_risk_skorlari?.[0];
            const advisor = student.akademik_personel;
            const program = student.program_turleri;
            const akademikDurum = student.ogrenci_akademik_durum?.[0];

            // Determine student status
            let durum = 'Ders Aşamasında';
            if (akademikDurum?.ders_tamamlandi_mi === true) {
                durum = 'Tez Aşamasında';
            }
            if (!student.aktif_mi) {
                durum = student.durum_turleri?.durum_adi || 'Pasif';
            }

            return {
                id: student.ogrenci_id,
                ad_soyad: `${student.ad} ${student.soyad}`,
                ogrenci_no: student.ogrenci_no,
                program: program?.program_adi || 'Bilinmiyor',
                gno: student.gno || 0,
                risk_durumu: {
                    skor: riskData?.risk_skoru || 0,
                    seviye: riskData?.risk_seviyesi || 'Dusuk'
                },
                danisman: advisor ? `${advisor.unvan} ${advisor.ad} ${advisor.soyad}` : 'Atanmamış',
                durum: durum,
                mevcut_yariyil: akademikDurum?.mevcut_yariyil || 1
            };
        });

        // Filter by risk level after transformation (since it comes from related table)
        let filteredData = transformedData;
        if (risk_level) {
            filteredData = transformedData.filter(s => s.risk_durumu.seviye === risk_level);
        }

        console.log('[DEBUG] Final response:', { dataCount: filteredData.length, totalCount: count });

        return {
            data: filteredData,
            meta: {
                total: count || 0,
                page: page,
                limit: limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };

    } catch (error) {
        console.error("Error fetching students list:", error.message);
        throw error;
    }
};

/**
 * Öğrenci Detay Bilgisi (Comprehensive Academic Record)
 * @param {String} studentId - UUID of student
 * @returns {Object} - Detailed student information
 */
const getStudentDetails = async (studentId) => {
    try {
        // 1. Base Student Info
        const { data: student, error: studentError } = await supabase
            .from('ogrenci')
            .select(`
                *,
                program_turleri (*),
                akademik_personel!ogrenci_danisman_id_fkey (unvan, ad, soyad, eposta),
                ogrenci_risk_skorlari (*),
                ogrenci_akademik_durum (*),
                ogrenci_asamalari (*),
                durum_turleri (*)
            `)
            .eq('ogrenci_id', studentId)
            .single();

        if (studentError) throw studentError;
        if (!student) throw new Error('Student not found');

        // 2. Course History (Başarısız Dersler + Not Dökümü)
        const { data: courses, error: coursesError } = await supabase
            .from('ogrenci_dersleri')
            .select(`
                *,
                dersler (ders_kodu, ders_adi, kredisi)
            `)
            .eq('ogrenci_id', studentId)
            .order('donem', { ascending: false });

        // 3. TİK Meetings (Tezli için)
        const { data: tikMeetings, error: tikError } = await supabase
            .from('tik_toplantilari')
            .select('*')
            .eq('ogrenci_id', studentId)
            .order('toplanti_tarihi', { ascending: false });

        // 4. Thesis Info (if exists)
        const { data: thesis, error: thesisError } = await supabase
            .from('tezler')
            .select('*')
            .eq('ogrenci_id', studentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // 5. Qualification Exams (Doktora için)
        const { data: yeterlikSinavlari, error: yeterlikError } = await supabase
            .from('yeterlik_sinavlari')
            .select('*')
            .eq('ogrenci_id', studentId)
            .order('sinav_tarihi', { ascending: false });

        // 6. Check program type
        const programAdi = student.program_turleri?.program_adi || '';
        const isTezli = !programAdi.toLowerCase().includes('tezsiz');
        const isDoktora = programAdi.toLowerCase().includes('doktora');

        // Build comprehensive response
        return {
            // Profil
            profil: {
                id: student.ogrenci_id,
                ad_soyad: `${student.ad} ${student.soyad}`,
                ogrenci_no: student.ogrenci_no,
                eposta: student.eposta,
                telefon: student.telefon,
                program: student.program_turleri,
                kayit_tarihi: student.kayit_tarihi,
                aktif_mi: student.aktif_mi,
                durum: student.durum_turleri?.durum_adi,
                gno: student.gno,
                mevcut_yariyil: student.ogrenci_akademik_durum?.[0]?.mevcut_yariyil
            },

            // Danışman
            danisman: student.akademik_personel ? {
                ad_soyad: `${student.akademik_personel.unvan} ${student.akademik_personel.ad} ${student.akademik_personel.soyad}`,
                eposta: student.akademik_personel.eposta
            } : null,

            // Risk Analizi
            risk_analizi: student.ogrenci_risk_skorlari?.[0] || null,

            // Akademik Durum
            akademik_durum: {
                ders_tamamlandi_mi: student.ogrenci_akademik_durum?.[0]?.ders_tamamlandi_mi || false,
                toplam_kredi: student.ogrenci_akademik_durum?.[0]?.toplam_kredi || 0,
                alinan_dersler: courses || [],
                basarisiz_dersler: (courses || []).filter(c => c.harf_notu === 'FF' || c.harf_notu === 'FD')
            },

            // Süreç Takibi (Program Türüne Göre)
            surec_takibi: {
                tezli: isTezli ? {
                    tik_toplantilari: tikMeetings || [],
                    tez_durumu: thesis || null
                } : null,
                doktora: isDoktora ? {
                    yeterlik_sinavlari: yeterlikSinavlari || []
                } : null
            },

            // Zaman Çizelgesi
            zaman_cizelgesi: student.ogrenci_asamalari || []
        };

    } catch (error) {
        console.error("Error fetching student details:", error.message);
        throw error;
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
    getCriticalAlarms,
    getStudentsByStage,
    getRiskyStudentsDetail,
    // Yeni API'ler
    getStudentsList,
    getStudentDetails
};
