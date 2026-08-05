/**
 * Authentication Logic
 * Handles login, registration, and logout using Supabase Auth
 */

document.addEventListener('DOMContentLoaded', () => {
    initAuthPage();
});

async function initAuthPage() {
    const supabase = window.SUPABASE_CLIENT;

    // 1. If we are inside the popup window and signed in, close popup immediately!
    if (window.opener) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.close();
            return;
        }
    }

    // 2. Listen for auth state change (when popup logs in, main window detects it)
    if (supabase && supabase.auth) {
        supabase.auth.onAuthStateChange((event, session) => {
            if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                if (window.opener) {
                    window.close();
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
        });
    }

    // Attach Google Auth button listener
    const googleBtn = document.querySelector('.google-auth-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleAuth);
        console.log("Button listener attached successfully.");
    } else {
        console.error("Could not find the Google Auth button in the HTML.");
    }

    // Check if main window is already logged in
    try {
        const alreadyAuth = await redirectIfAuth();
        if (alreadyAuth) return;
    } catch (e) {
        console.error("Error checking auth status:", e);
    }
}

async function handleGoogleAuth(e) {
    e.preventDefault();
    console.log("Google button clicked! Launching OAuth popup window...");

    try {
        const supabase = window.SUPABASE_CLIENT;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                skipBrowserRedirect: true,
                redirectTo: window.location.origin + '/dashboard.html',
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

        if (data?.url) {
            // Calculate screen center for sleek 500x620 popup window
            const width = 500;
            const height = 620;
            const left = Math.max(0, (window.screen.width / 2) - (width / 2));
            const top = Math.max(0, (window.screen.height / 2) - (height / 2));

            window.open(
                data.url,
                'GoogleAuthPopup',
                `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
            );
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
