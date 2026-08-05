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
        console.log("Google button found and listener attached!");
        googleBtn.addEventListener('click', handleGoogleAuth);
    } else {
        console.error("Google button NOT found!");
    }
}

async function handleGoogleAuth(e) {
    e.preventDefault();
    console.log("Google button clicked! Initiating OAuth...");

    try {
        const supabase = window.SUPABASE_CLIENT;
        console.log("Supabase client:", supabase);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });

        console.log("OAuth response:", { data, error });

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
