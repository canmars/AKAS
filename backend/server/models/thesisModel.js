const supabase = require('../config/supabase');

const getThesisFunnelStats = async () => {
    try {
        // Fetch valid active students with their status code
        // Utilizing the relation between ogrenci and durum_turleri
        const { data, error } = await supabase
            .from('ogrenci')
            .select(`
                ogrenci_id,
                durum_turleri!inner (
                    durum_kodu
                )
            `)
            .eq('aktif_mi', true);

        if (error) {
            throw error;
        }

        const stats = {
            total: 0,
            course: 0,
            thesis: 0,
            graduate: 0
        };

        stats.total = data.length;

        data.forEach(student => {
            const code = student.durum_turleri?.durum_kodu;

            if (code === 'DERS_ASAMASI') {
                stats.course++;
            } else if (['TEZ_ASAMASI', 'TEZ_ONERI', 'TEZ_YAZIM'].includes(code)) {
                stats.thesis++;
            } else if (code === 'MEZUN') {
                stats.graduate++;
            }
        });

        return stats;

    } catch (error) {
        throw error;
    }
};

module.exports = {
    getThesisFunnelStats,
};
