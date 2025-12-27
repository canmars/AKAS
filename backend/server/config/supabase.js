const path = require('path');
const dotenvPath = path.join(__dirname, '../../.env');
console.log('Loading .env from:', dotenvPath);

const result = require('dotenv').config({ path: dotenvPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Auth işlemleri için SERVICE_ROLE_KEY kullan (admin yetkisi gerekiyor)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('SUPABASE_URL found:', !!supabaseUrl);
console.log('SUPABASE_KEY found:', !!supabaseKey);
console.log('Using SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is missing in .env file. Please check backend/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
    global: {
        fetch: (url, options = {}) => {
            // Extend timeout to 60 seconds
            return fetch(url, {
                ...options,
                signal: options.signal || AbortSignal.timeout(60000),
            });
        },
    },
});

module.exports = supabase;
