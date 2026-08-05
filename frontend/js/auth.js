/**
 * Authentication Logic
 * Handles login, registration, and logout using Supabase Auth
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuthPage();
});

async function initAuthPage() {
    // Check if already logged in
    const alreadyAuth = await redirectIfAuth();
    if (alreadyAuth) return;
    // Google Auth button
    const googleBtn = document.querySelector('.google-auth-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleAuth);
    }
}

async function handleGoogleAuth(e) {
    e.preventDefault();
    try {
        const supabase = window.SUPABASE_CLIENT;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });
        if (error) throw error;
    } catch (error) {
        showToast(error.message || 'Google Sign-In failed', 'error');
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
