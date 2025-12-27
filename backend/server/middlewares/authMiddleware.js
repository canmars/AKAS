const jwt = require('jsonwebtoken');

/**
 * JWT Token Doğrulama Middleware
 * 
 * Authorization header'dan Bearer token'ı alır ve doğrular.
 * Token geçerliyse, kullanıcı bilgilerini req.user'a ekler.
 */
const verifyToken = (req, res, next) => {
    try {
        // Authorization header'dan token'ı al
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Yetkilendirme token\'ı bulunamadı'
            });
        }

        // "Bearer " kısmını çıkar, sadece token'ı al
        const token = authHeader.substring(7);

        // JWT_SECRET kontrolü
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined in .env file');
            return res.status(500).json({
                success: false,
                message: 'Sunucu yapılandırma hatası'
            });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, jwtSecret);

        // Kullanıcı bilgilerini request'e ekle
        req.user = {
            userId: decoded.userId,
            personelId: decoded.personelId,
            email: decoded.email,
            role: decoded.role
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş. Lütfen tekrar giriş yapın'
            });
        }

        console.error('Token Verification Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Token doğrulama hatası'
        });
    }
};

/**
 * Rol Tabanlı Erişim Kontrolü (RBAC) Middleware
 * 
 * Belirtilen rol(ler)e sahip kullanıcılara erişim izni verir.
 * 
 * @param {...string} allowedRoles - İzin verilen roller (örn: 'Bolum_Baskani', 'Danisman')
 * @returns {Function} Express middleware function
 * 
 * Kullanım:
 * router.get('/admin-only', verifyToken, verifyRole('Bolum_Baskani'), controller)
 * router.get('/both', verifyToken, verifyRole('Bolum_Baskani', 'Danisman'), controller)
 */
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // verifyToken middleware'i çalıştırılmış olmalı
            if (!req.user || !req.user.role) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı doğrulaması yapılmamış'
                });
            }

            // Kullanıcının rolü izin verilen roller arasında mı?
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu işlem için yetkiniz bulunmamaktadır',
                    requiredRoles: allowedRoles,
                    userRole: req.user.role
                });
            }

            next();

        } catch (error) {
            console.error('Role Verification Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Yetki kontrolü sırasında bir hata oluştu'
            });
        }
    };
};

module.exports = {
    verifyToken,
    verifyRole
};
