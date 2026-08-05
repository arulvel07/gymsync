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

    // Tab toggle
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginTab && registerTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    // Login form
    const loginFormEl = document.getElementById('login-form-el');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerFormEl = document.getElementById('register-form-el');
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    clearErrors();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validation
    if (!email || !password) {
        showFieldError('login-email', 'All fields are required');
        setButtonLoading(btn, false);
        return;
    }

    try {
        const supabase = window.SUPABASE_CLIENT;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        showToast('Welcome back! Redirecting...', 'success');

        // Check if admin and redirect accordingly
        setTimeout(async () => {
            try {
                const profile = await apiRequest('/api/profile');
                if (profile.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch {
                window.location.href = 'dashboard.html';
            }
        }, 800);

    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
        showFieldError('login-email', error.message || 'Invalid email or password');
    } finally {
        setButtonLoading(btn, false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    clearErrors();

    const fullName = document.getElementById('reg-name').value.trim();
    const rollNumber = document.getElementById('reg-roll').value.trim().toUpperCase();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    // Validation
    if (!fullName || !rollNumber || !email || !password || !confirmPassword) {
        showToast('All fields are required', 'error');
        setButtonLoading(btn, false);
        return;
    }

    if (password.length < 6) {
        showFieldError('reg-password', 'Password must be at least 6 characters');
        setButtonLoading(btn, false);
        return;
    }

    if (password !== confirmPassword) {
        showFieldError('reg-confirm-password', 'Passwords do not match');
        setButtonLoading(btn, false);
        return;
    }

    // Optional: Restrict to institute email
    // if (!email.endsWith('@iiitdm.ac.in')) {
    //     showFieldError('reg-email', 'Please use your @iiitdm.ac.in email');
    //     setButtonLoading(btn, false);
    //     return;
    // }

    try {
        const supabase = window.SUPABASE_CLIENT;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    roll_number: rollNumber,
                },
            },
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
            showToast('Registration successful! Please check your email to verify your account.', 'success', 6000);
            // Switch to login tab
            document.getElementById('login-tab').click();
        } else {
            showToast('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }

    } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
        if (error.message?.includes('already registered')) {
            showFieldError('reg-email', 'This email is already registered');
        }
    } finally {
        setButtonLoading(btn, false);
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
