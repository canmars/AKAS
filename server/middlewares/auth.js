/**
 * Authentication Middleware
 * Kullanıcı kimlik doğrulama kontrolü
 */

import { supabase } from '../db/connection.js';

export const authenticate = async (req, res, next) => {
  try {
    // Supabase auth token'ı header'dan al
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

    // Token'ı doğrula
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized: Invalid token'
        }
      });
    }

    // Kullanıcı bilgisini request'e ekle
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized: Authentication failed'
      }
    });
  }
};

// Optional authentication (token varsa doğrula, yoksa devam et)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Hata olsa bile devam et (optional auth)
    next();
  }
};

