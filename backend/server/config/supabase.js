require('dotenv').config({ path: '../.env' }); // Adjust path if needed depending on where node is run
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
