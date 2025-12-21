/**
 * Auth Controller
 * Kullanıcı kimlik doğrulama iş mantığı
 */

import { supabase, supabaseAdmin } from '../db/connection.js';

export class AuthController {
  /**
   * POST /api/auth/login
   * Kullanıcı girişi
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'E-posta ve şifre gereklidir'
          }
        });
      }

      // Development modunda basit kontrol
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
      
      if (isDevelopment) {
        // Development: kullanicilar tablosundan kontrol et
        const { data: kullanici, error } = await supabaseAdmin
          .from('kullanicilar')
          .select('kullanici_id, email, rol, aktif_mi, ad, soyad')
          .eq('email', email.toLowerCase().trim())
          .eq('aktif_mi', true)
          .single();

        if (error || !kullanici) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'E-posta veya şifre hatalı'
            }
          });
        }

        // Development modunda şifre kontrolü yapmıyoruz (güvenlik için production'da Supabase Auth kullanılmalı)
        // Basit bir token oluştur
        const token = `dev-token-${kullanici.kullanici_id}-${Date.now()}`;

        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: kullanici.kullanici_id,
              email: kullanici.email,
              role: kullanici.rol,
              name: `${kullanici.ad || ''} ${kullanici.soyad || ''}`.trim()
            },
            role: kullanici.rol
          }
        });
      } else {
        // Production: Supabase Auth kullan
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password
        });

        if (error || !data.user) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'E-posta veya şifre hatalı'
            }
          });
        }

        // Kullanıcı bilgilerini kullanicilar tablosundan al
        const { data: kullanici, error: kullaniciError } = await supabaseAdmin
          .from('kullanicilar')
          .select('kullanici_id, email, rol, aktif_mi, ad, soyad')
          .eq('kullanici_id', data.user.id)
          .eq('aktif_mi', true)
          .single();

        if (kullaniciError || !kullanici) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Kullanıcı bulunamadı veya hesap aktif değil'
            }
          });
        }

        return res.json({
          success: true,
          data: {
            token: data.session.access_token,
            user: {
              id: kullanici.kullanici_id,
              email: kullanici.email,
              role: kullanici.rol,
              name: `${kullanici.ad || ''} ${kullanici.soyad || ''}`.trim()
            },
            role: kullanici.rol
          }
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Giriş işlemi sırasında bir hata oluştu',
          details: error.message
        }
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Kullanıcı çıkışı
   */
  static async logout(req, res) {
    try {
      // Supabase Auth logout (production için)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        await supabase.auth.signOut(token);
      }

      return res.json({
        success: true,
        message: 'Çıkış başarılı'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Çıkış işlemi sırasında bir hata oluştu'
        }
      });
    }
  }

  /**
   * GET /api/auth/me
   * Mevcut kullanıcı bilgilerini getir
   */
  static async getMe(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Unauthorized: No token provided'
          }
        });
      }

      const token = authHeader.split(' ')[1];
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';

      if (isDevelopment && token.startsWith('dev-token-')) {
        // Development token'dan kullanıcı ID'sini çıkar
        const userId = token.split('-')[2];
        
        const { data: kullanici, error } = await supabaseAdmin
          .from('kullanicilar')
          .select('kullanici_id, email, rol, aktif_mi, ad, soyad')
          .eq('kullanici_id', userId)
          .eq('aktif_mi', true)
          .single();

        if (error || !kullanici) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Kullanıcı bulunamadı'
            }
          });
        }

        return res.json({
          success: true,
          data: {
            id: kullanici.kullanici_id,
            email: kullanici.email,
            role: kullanici.rol,
            name: `${kullanici.ad || ''} ${kullanici.soyad || ''}`.trim()
          }
        });
      } else {
        // Production: Supabase Auth token doğrula
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Unauthorized: Invalid token'
            }
          });
        }

        // Kullanıcı bilgilerini kullanicilar tablosundan al
        const { data: kullanici, error: kullaniciError } = await supabaseAdmin
          .from('kullanicilar')
          .select('kullanici_id, email, rol, aktif_mi, ad, soyad')
          .eq('kullanici_id', user.id)
          .eq('aktif_mi', true)
          .single();

        if (kullaniciError || !kullanici) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Kullanıcı bulunamadı'
            }
          });
        }

        return res.json({
          success: true,
          data: {
            id: kullanici.kullanici_id,
            email: kullanici.email,
            role: kullanici.rol,
            name: `${kullanici.ad || ''} ${kullanici.soyad || ''}`.trim()
          }
        });
      }
    } catch (error) {
      console.error('GetMe error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Kullanıcı bilgileri alınırken bir hata oluştu'
        }
      });
    }
  }
}

