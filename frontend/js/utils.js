/**
 * Shared Utility Functions
 * API helpers, date formatting, toast notifications, and loading states
 */

// ── API Helper ─────────────────────────────────────────────

/**
 * Make an authenticated API request to the FastAPI backend.
 * Automatically injects the Supabase JWT token.
 */
async function apiRequest(endpoint, options = {}) {
    const supabase = window.SUPABASE_CLIENT;
    const baseUrl = window.API_BASE_URL;

    // Get current session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error(`apiRequest failed for ${baseUrl}${endpoint}:`, err);
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            throw new Error(`Connection failed to ${baseUrl}. Check network or adblocker.`);
        }
        throw err;
    }
}

/**
 * Make a public API request (no auth required).
 */
async function publicApiRequest(endpoint) {
    const baseUrl = window.API_BASE_URL;
    try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error(`publicApiRequest failed for ${baseUrl}${endpoint}:`, err);
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            throw new Error(`Connection failed to ${baseUrl}. Check network or adblocker.`);
        }
        throw err;
    }
}


// ── Date/Time Formatting ───────────────────────────────────

/**
 * Format an ISO datetime string to a human-readable date.
 */
function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format an ISO datetime string to time (HH:MM AM/PM).
 */
function formatTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format an ISO datetime string to "DD Mon, HH:MM AM/PM".
 */
function formatDateTime(isoString) {
    if (!isoString) return '—';
    return `${formatDate(isoString)}, ${formatTime(isoString)}`;
}

/**
 * Format duration in minutes to "Xh Ym" string.
 */
function formatDuration(minutes) {
    if (!minutes && minutes !== 0) return '—';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format hour (0-23) to "6 AM", "2 PM" etc.
 */
function formatHour(hour) {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
}

/**
 * Get elapsed time string from a start ISO time.
 */
function getElapsedTime(startIso) {
    const start = new Date(startIso);
    const now = new Date();
    const diffMs = now - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return {
        hours,
        minutes,
        seconds,
        display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
}


// ── Toast Notifications ────────────────────────────────────

/**
 * Show a toast notification.
 * @param {string} message - The message to show
 * @param {'success'|'error'|'info'} type - Toast type
 * @param {number} duration - Duration in ms (default 4000)
 */
function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}


// ── Loading States ─────────────────────────────────────────

/**
 * Set a button to loading state.
 */
function setButtonLoading(btn, loading = true) {
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<span class="spinner"></span> Loading...`;
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        btn.disabled = false;
    }
}

/**
 * Show a skeleton loading placeholder in a container.
 */
function showSkeleton(container, count = 3, height = '60px') {
    container.innerHTML = Array(count).fill(0).map(() =>
        `<div class="skeleton" style="height: ${height}; margin-bottom: 8px;"></div>`
    ).join('');
}


// ── Occupancy Helpers ──────────────────────────────────────

/**
 * Get occupancy level info based on percentage.
 */
function getOccupancyLevel(percentage) {
    if (percentage <= 40) return { label: 'Plenty of space', class: 'low', color: '#10b981' };
    if (percentage <= 70) return { label: 'Getting busy', class: 'moderate', color: '#f59e0b' };
    if (percentage <= 90) return { label: 'Crowded', class: 'high', color: '#f97316' };
    return { label: 'Almost full', class: 'full', color: '#ef4444' };
}

/**
 * Get a color for a workout type.
 */
const WORKOUT_COLORS = {
    'Push':       '#3b82f6',
    'Pull':       '#8b5cf6',
    'Legs':       '#10b981',
    'Upper Body': '#06b6d4',
    'Lower Body': '#f59e0b',
    'Cardio':     '#ef4444',
    'Full Body':  '#ec4899',
    'Core':       '#f97316',
};

function getWorkoutColor(type) {
    return WORKOUT_COLORS[type] || '#94a3b8';
}

/**
 * Get an emoji for a workout type.
 */
const WORKOUT_ICONS = {
    'Push':       '💪',
    'Pull':       '🏋️',
    'Legs':       '🦵',
    'Upper Body': '🔝',
    'Lower Body': '⬇️',
    'Cardio':     '🏃',
    'Full Body':  '⚡',
    'Core':       '🎯',
};

function getWorkoutIcon(type) {
    return WORKOUT_ICONS[type] || '🏋️';
}


// ── Auth Guard ─────────────────────────────────────────────

/**
 * Redirect to login if not authenticated.
 * Call this on protected pages.
 */
async function requireAuth() {
    const supabase = window.SUPABASE_CLIENT;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return session;
}

/**
 * Redirect to dashboard if already authenticated.
 * Call this on login/register pages.
 */
async function redirectIfAuth() {
    const supabase = window.SUPABASE_CLIENT;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// ── CSV Export ──────────────────────────────────────────────

/**
 * Export an array of objects as CSV download.
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(h => {
                let val = row[h] ?? '';
                if (typeof val === 'string' && val.includes(',')) {
                    val = `"${val}"`;
                }
                return val;
            }).join(',')
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// ── Global Logout Handler ──────────────────────────────────
async function handleLogout() {
    const supabase = window.SUPABASE_CLIENT;
    await supabase.auth.signOut();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}
window.handleLogout = handleLogout;
