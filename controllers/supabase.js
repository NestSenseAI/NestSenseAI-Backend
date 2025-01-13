require('dotenv').config(); // Load environment variables
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase; // Export the client to use in your routes
