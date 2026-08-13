/**
 * Authentication Logic
 * Handles login, registration, and logout using Supabase Auth
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuthPage();
});

async function initAuthPage() {
    // Attach Google Auth button listener
    const googleBtn = document.querySelector('.google-auth-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleAuth);
    }

    const supabase = window.SUPABASE_CLIENT;
    if (supabase) {
        try {
            // 1. Immediate session check
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const pendingToken = sessionStorage.getItem('pending_qr_token');
                window.location.href = pendingToken ? `check-in.html?token=${encodeURIComponent(pendingToken)}` : 'dashboard.html';
                return;
            }

            // 2. Direct Auth State Listener for Google OAuth async token parsing
            supabase.auth.onAuthStateChange((event, session) => {
                if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
                    const pendingToken = sessionStorage.getItem('pending_qr_token');
                    window.location.href = pendingToken ? `check-in.html?token=${encodeURIComponent(pendingToken)}` : 'dashboard.html';
                }
            });
        } catch (e) {
            console.warn('Auth check note:', e);
        }
    }

    // Fallback check
    try {
        const alreadyAuth = await redirectIfAuth();
        if (alreadyAuth) return;
    } catch (e) {
        console.error("Error checking auth status:", e);
    }
}

async function handleGoogleAuth(e) {
    e.preventDefault();
    console.log("Google button clicked! Initiating OAuth redirect...");

    try {
        const supabase = window.SUPABASE_CLIENT;
        const pendingToken = sessionStorage.getItem('pending_qr_token');
        let redirectTarget = window.location.origin + '/dashboard.html';

        if (pendingToken) {
            redirectTarget = window.location.origin + '/check-in.html?token=' + encodeURIComponent(pendingToken);
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTarget,
                queryParams: {
                    hd: 'iiitdm.ac.in', // Force Google to only accept college emails
                    prompt: 'select_account' // Always ask them to pick an account
                }
            }
        });

        if (error) {
            console.error("Supabase OAuth Error:", error);
            alert("Error: " + error.message);
            throw error;
        }
    } catch (error) {
        console.error("Caught error in handleGoogleAuth:", error);
        alert("Google Sign-In failed. Check console for details.");
    }
}

async function handleLogout() {
    const supabase = window.SUPABASE_CLIENT;
    await supabase.auth.signOut();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// ── Error Helpers ──────────────────────────────────────────

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const errorEl = field.parentElement.querySelector('.form-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    field.style.borderColor = 'var(--accent-red)';
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.form-input').forEach(el => {
        el.style.borderColor = '';
    });
}

// Make handleLogout globally available
window.handleLogout = handleLogout;
