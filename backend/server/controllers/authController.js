const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

/**
 * Login Controller
 * 
 * Adımlar:
 * 1. Supabase Auth ile kullanıcının email/şifresini doğrula
 * 2. Başarılıysa, gelen email ile public.akademik_personel tablosunu sorgula
 * 3. Kullanıcının rol değerini çek
 * 4. JWT token oluştur
 * 5. Frontend'e user data, role ve redirectUrl dön
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasyon
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email ve şifre gereklidir'
            });
        }

        // 1. Supabase Auth ile kullanıcı doğrulama
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // 2. akademik_personel tablosundan kullanıcı bilgilerini çek
        const { data: personelData, error: personelError } = await supabase
            .from('akademik_personel')
            .select('personel_id, ad, soyad, email, rol')
            .eq('email', email)
            .single();

        if (personelError || !personelData) {
            console.error('Personel Query Error:', personelError);
            return res.status(403).json({
                success: false,
                message: 'Bu kullanıcının sisteme erişim yetkisi bulunmamaktadır'
            });
        }

        // 3. Rol kontrolü - sadece Danisman ve Bolum_Baskani rolleri kabul edilir
        const allowedRoles = ['Danisman', 'Bolum_Baskani'];
        if (!allowedRoles.includes(personelData.rol)) {
            return res.status(403).json({
                success: false,
                message: 'Bu rol için sisteme erişim yetkisi bulunmamaktadır'
            });
        }

        // 4. JWT token oluştur
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined in .env file');
            return res.status(500).json({
                success: false,
                message: 'Sunucu yapılandırma hatası'
            });
        }

        const token = jwt.sign(
            {
                userId: authData.user.id,
                personelId: personelData.personel_id,
                email: personelData.email,
                role: personelData.rol
            },
            jwtSecret,
            { expiresIn: '24h' } // Token 24 saat geçerli
        );

        // 5. Role göre redirectUrl belirle
        let redirectUrl = '/dashboard'; // Default
        if (personelData.rol === 'Danisman') {
            redirectUrl = '/my-students';
        } else if (personelData.rol === 'Bolum_Baskani') {
            redirectUrl = '/dashboard';
        }

        // 6. Başarılı response
        return res.status(200).json({
            success: true,
            token,
            user: {
                personelId: personelData.personel_id,
                ad_soyad: `${personelData.ad} ${personelData.soyad}`, // ad ve soyad'ı birleştir
                email: personelData.email,
                role: personelData.rol,
                redirectUrl
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Giriş işlemi sırasında bir hata oluştu'
        });
    }
};

module.exports = {
    login
};
