/**
 * Supabase Client Configuration
 * Replace these values with your Supabase project credentials
 */

const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // e.g. https://abcdef.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // public anon key

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Backend API URL
const API_BASE_URL = 'http://localhost:8000';

// Export for use in other modules (via global scope since no bundler)
window.SUPABASE_CLIENT = supabase;
window.API_BASE_URL = API_BASE_URL;
