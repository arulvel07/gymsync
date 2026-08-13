/**
 * Supabase Client Configuration
 * Replace these values with your Supabase project credentials
 */

console.log("Supabase config script starting...");

const SUPABASE_URL = 'https://owrqljgboratvcmuzpkx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cnFsamdib3JhdHZjbXV6cGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjMwNTYsImV4cCI6MjEwMTQ5OTA1Nn0.GgVitgmpcehOnsBzjfWe8lrI4J3bMamhBTO2-LAW1mQ';

try {
    if (typeof window.supabase === 'undefined') {
        alert("ERROR: The Supabase library failed to load! Please turn off your Ad-Blocker, Brave Shields, or check your internet connection.");
        throw new Error("window.supabase is undefined. CDN blocked.");
    }

    console.log("Is window.supabase defined?", typeof window.supabase);
    // Initialize the Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Backend API URL
    const API_BASE_URL = 'https://gym-qxdu.onrender.com';

    // Export for use in other modules
    window.SUPABASE_CLIENT = supabase;
    window.API_BASE_URL = API_BASE_URL;
    console.log("window.SUPABASE_CLIENT successfully set!");

    // ── Early Auth Listener ────────────────────────────────
    // Set up onAuthStateChange IMMEDIATELY so we never miss events.
    // This resolves with the authenticated session (or null).
    const _hasOAuthParams = () => {
        const h = window.location.hash;
        const s = window.location.search;
        return (h && (h.includes('access_token') || h.includes('error')))
            || (s && (s.includes('code=') || s.includes('error=')));
    };
    const isOAuth = _hasOAuthParams();

    window.SUPABASE_AUTH_READY = new Promise((resolve) => {
        let settled = false;
        const finish = (session) => {
            if (settled) return;
            settled = true;
            clearTimeout(safetyTimer);
            console.log('[Auth] Session resolved:', !!session, 'OAuth callback:', isOAuth);
            resolve(session);
        };

        // Safety timeout — never hang forever
        const safetyTimer = setTimeout(() => finish(null), isOAuth ? 5000 : 2000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] onAuthStateChange event:', event, 'hasSession:', !!session);

            if (session) {
                // Got a valid session — done
                subscription.unsubscribe();
                finish(session);
            } else if (event === 'INITIAL_SESSION' && !isOAuth) {
                // No session and not an OAuth callback — user is not logged in
                subscription.unsubscribe();
                finish(null);
            }
            // If INITIAL_SESSION fires null + OAuth params are present,
            // keep waiting for SIGNED_IN after PKCE code exchange completes.
        });
    });

} catch (e) {
    console.error("CRITICAL ERROR in supabase-config.js:", e);
    // Ensure the promise exists even on error so pages don't hang
    window.SUPABASE_AUTH_READY = Promise.resolve(null);
}

