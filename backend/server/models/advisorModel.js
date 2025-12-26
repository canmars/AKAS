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

module.exports = {
    getAdvisorsWithLoad,
};
