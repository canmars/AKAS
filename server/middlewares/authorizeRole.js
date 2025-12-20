/**
 * Role-Based Authorization Middleware
 * Rol bazlı yetkilendirme kontrolü
 */

import { supabaseAdmin } from '../db/connection.js';

/**
 * Belirli rollere izin veren middleware
 * @param {Array<string>} allowedRoles - İzin verilen roller
 * @returns {Function} Express middleware
 */
export const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Önce authenticate middleware'inin çalıştığından emin ol
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Unauthorized: Authentication required'
          }
        });
      }

      // Kullanıcı rolünü veritabanından al
      const { data: kullanici, error } = await supabaseAdmin
        .from('kullanicilar')
        .select('rol, aktif_mi')
        .eq('kullanici_id', req.user.id)
        .single();

      if (error || !kullanici) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Kullanıcı bulunamadı'
          }
        });
      }

      // Kullanıcı aktif mi kontrolü
      if (!kullanici.aktif_mi) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Hesabınız aktif değil'
          }
        });
      }

      // Rol kontrolü
      if (!allowedRoles.includes(kullanici.rol)) {
        return res.status(403).json({
          success: false,
          error: {
            message: `Bu işlem için ${allowedRoles.join(' veya ')} yetkisi gereklidir. Mevcut rolünüz: ${kullanici.rol}`
          }
        });
      }

      // Kullanıcı bilgisini request'e ekle
      req.user.rol = kullanici.rol;
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Authorization check failed',
          details: error.message
        }
      });
    }
  };
};

/**
 * Admin yetkisi kontrolü
 */
export const requireAdmin = authorizeRole(['Admin']);

/**
 * Bölüm Başkanı yetkisi kontrolü
 */
export const requireBolumBaskani = authorizeRole(['Bolum_Baskani', 'Admin']);

/**
 * Danışman yetkisi kontrolü
 */
export const requireDanisman = authorizeRole(['Danisman', 'Bolum_Baskani', 'Admin']);

/**
 * Öğrenci yetkisi kontrolü
 */
export const requireOgrenci = authorizeRole(['Ogrenci']);

