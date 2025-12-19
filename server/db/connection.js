/**
 * Supabase Database Connection
 * Supabase client yapılandırması
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Public client (anon key ile - RLS politikaları aktif)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client (service role key ile - RLS politikalarını bypass eder)
// Sadece backend'de kullanılmalı, asla frontend'e gönderilmemeli
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export default supabase;

