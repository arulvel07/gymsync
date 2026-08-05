/**
 * Authentication Logic
 * Handles login, registration, and logout using Supabase Auth
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuthPage();
});

async function initAuthPage() {
    // Attach Google Auth listener IMMEDIATELY
    const googleBtn = document.querySelector('.google-auth-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleAuth);
        console.log("Button listener attached successfully.");
    } else {
        console.error("Could not find the Google Auth button in the HTML.");
    }

    // Now check if already logged in
    try {
        const alreadyAuth = await redirectIfAuth();
        if (alreadyAuth) return;
    } catch (e) {
        console.error("Error checking auth status:", e);
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
                redirectTo: window.location.origin + '/dashboard.html',
                queryParams: {
                    hd: 'iiitdm.ac.in', // Force Google to only accept college emails
                    prompt: 'select_account' // Always ask them to pick an account so they aren't auto-logged into a wrong one
                }
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
