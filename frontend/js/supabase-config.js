/**
 * Supabase Client Configuration
 * Replace these values with your Supabase project credentials
 */

console.log("Supabase config script starting...");

const SUPABASE_URL = 'https://owrqljgboratvcmuzpkx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cnFsamdib3JhdHZjbXV6cGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjMwNTYsImV4cCI6MjEwMTQ5OTA1Nn0.GgVitgmpcehOnsBzjfWe8lrI4J3bMamhBTO2-LAW1mQ';

try {
    console.log("Is window.supabase defined?", typeof window.supabase);
    // Initialize the Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("createClient returned:", supabase);

    // Backend API URL
    const API_BASE_URL = 'https://gym-qxdu.onrender.com';

    // Export for use in other modules
    window.SUPABASE_CLIENT = supabase;
    window.API_BASE_URL = API_BASE_URL;
    console.log("window.SUPABASE_CLIENT successfully set!");
} catch (e) {
    console.error("CRITICAL ERROR in supabase-config.js:", e);
}
