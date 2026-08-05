/**
 * Student Dashboard Logic
 * Handles occupancy display, check-in/out, workout distribution, session history
 */

let activeSession = null;
let timerInterval = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {
    const session = await requireAuth();
    if (!session) return;

    // Load user profile
    await loadProfile();

    // Load all dashboard data
    await Promise.all([
        loadOccupancy(),
        checkActiveSession(),
        loadSessionHistory(),
        loadPeakHours(),
    ]);

    // Setup workout pills
    setupWorkoutPills();

    // Setup check-in/out buttons
    document.getElementById('checkin-btn')?.addEventListener('click', handleCheckIn);
    document.getElementById('checkout-btn')?.addEventListener('click', handleCheckOut);

    // Auto-refresh every 30 seconds
    refreshInterval = setInterval(() => {
        loadOccupancy();
    }, 30000);

    // Logout handler
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}


// ── Profile ────────────────────────────────────────────────

async function loadProfile() {
    try {
        const profile = await apiRequest('/api/profile');
        const nameEl = document.getElementById('user-name');
        const roleEl = document.getElementById('user-role');
        if (nameEl) nameEl.textContent = profile.full_name || 'Student';
        if (roleEl) {
            roleEl.textContent = profile.role;
            roleEl.className = `badge ${profile.role === 'admin' ? 'badge-blue' : 'badge-green'}`;
        }

        // Show admin link if admin
        if (profile.role === 'admin') {
            const adminLink = document.getElementById('admin-nav-link');
            if (adminLink) adminLink.style.display = 'flex';
        }
    } catch (err) {
        console.error('Failed to load profile:', err);
    }
}


// ── Occupancy ──────────────────────────────────────────────

async function loadOccupancy() {
    try {
        const data = await publicApiRequest('/api/occupancy');
        updateOccupancyDisplay(data);
        updateWorkoutDistribution(data.workout_distribution);
    } catch (err) {
        console.error('Failed to load occupancy:', err);
    }
}

function updateOccupancyDisplay(data) {
    const { current_count, max_capacity, percentage, is_open } = data;
    const level = getOccupancyLevel(percentage);

    // Update count
    const countEl = document.getElementById('occupancy-count');
    if (countEl) {
        countEl.textContent = current_count;
        countEl.className = `stat-number text-5xl occupancy-${level.class}`;
    }

    // Update capacity text
    const capEl = document.getElementById('occupancy-capacity');
    if (capEl) capEl.textContent = `/ ${max_capacity}`;

    // Update percentage
    const pctEl = document.getElementById('occupancy-pct');
    if (pctEl) pctEl.textContent = `${percentage}%`;

    // Update label
    const labelEl = document.getElementById('occupancy-label');
    if (labelEl) {
        labelEl.textContent = is_open ? level.label : 'Gym Closed';
        labelEl.className = `text-sm font-medium occupancy-${level.class}`;
    }

    // Update ring
    const ring = document.getElementById('ring-fill');
    if (ring) {
        const circumference = 2 * Math.PI * 88;
        const offset = circumference - (percentage / 100) * circumference;
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
        ring.style.stroke = level.color;
    }

    // Status badge
    const statusEl = document.getElementById('gym-status');
    if (statusEl) {
        if (!is_open) {
            statusEl.innerHTML = `<span class="badge badge-red">● Closed</span>`;
        } else if (percentage >= 90) {
            statusEl.innerHTML = `<span class="badge badge-red">● Almost Full</span>`;
        } else {
            statusEl.innerHTML = `<span class="badge badge-green">● Open</span>`;
        }
    }
}

function updateWorkoutDistribution(distribution) {
    const container = document.getElementById('workout-dist-bars');
    if (!container) return;

    if (!distribution || distribution.length === 0) {
        container.innerHTML = `<p class="text-sm" style="color: var(--text-muted); text-align: center; padding: 20px;">No one in the gym right now</p>`;
        return;
    }

    const maxCount = Math.max(...distribution.map(d => d.count));

    container.innerHTML = distribution.map(d => {
        const pct = (d.count / maxCount) * 100;
        const color = getWorkoutColor(d.workout_type);
        const icon = getWorkoutIcon(d.workout_type);
        return `
            <div class="workout-bar-container">
                <div class="workout-bar-label">
                    <span style="color: var(--text-primary);">${icon} ${d.workout_type}</span>
                    <span class="stat-number" style="color: ${color};">${d.count}</span>
                </div>
                <div class="workout-bar-track">
                    <div class="workout-bar-fill" style="width: ${pct}%; background: ${color};"></div>
                </div>
            </div>
        `;
    }).join('');
}


// ── Check-in / Check-out ───────────────────────────────────

async function checkActiveSession() {
    try {
        const data = await apiRequest('/api/active-session');
        if (data.active && data.session) {
            activeSession = data.session;
            showCheckoutUI();
        } else {
            activeSession = null;
            showCheckinUI();
        }
    } catch (err) {
        console.error('Failed to check active session:', err);
        showCheckinUI();
    }
}

function showCheckinUI() {
    const checkinPanel = document.getElementById('checkin-panel');
    const checkoutPanel = document.getElementById('checkout-panel');
    if (checkinPanel) checkinPanel.style.display = 'block';
    if (checkoutPanel) checkoutPanel.style.display = 'none';
    clearInterval(timerInterval);
}

function showCheckoutUI() {
    const checkinPanel = document.getElementById('checkin-panel');
    const checkoutPanel = document.getElementById('checkout-panel');
    if (checkinPanel) checkinPanel.style.display = 'none';
    if (checkoutPanel) checkoutPanel.style.display = 'block';

    // Show workout type
    const workoutEl = document.getElementById('active-workout-type');
    if (workoutEl && activeSession) {
        workoutEl.textContent = `${getWorkoutIcon(activeSession.workout_type)} ${activeSession.workout_type}`;
    }

    // Start timer
    startTimer();
}

function startTimer() {
    if (!activeSession) return;
    clearInterval(timerInterval);

    const update = () => {
        const elapsed = getElapsedTime(activeSession.check_in);
        const timerEl = document.getElementById('session-timer');
        if (timerEl) timerEl.textContent = elapsed.display;
    };

    update();
    timerInterval = setInterval(update, 1000);
}

function setupWorkoutPills() {
    const pills = document.querySelectorAll('.workout-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });
}

async function handleCheckIn() {
    const selected = document.querySelector('.workout-pill.active');
    if (!selected) {
        showToast('Please select a workout type', 'error');
        return;
    }

    const workoutType = selected.dataset.type;
    const btn = document.getElementById('checkin-btn');
    setButtonLoading(btn, true);

    try {
        const session = await apiRequest('/api/check-in', {
            method: 'POST',
            body: JSON.stringify({ workout_type: workoutType }),
        });
        activeSession = session;
        showCheckoutUI();
        showToast(`Checked in! Training ${workoutType}`, 'success');
        loadOccupancy(); // Refresh occupancy
    } catch (err) {
        showToast(err.message || 'Check-in failed', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

async function handleCheckOut() {
    const btn = document.getElementById('checkout-btn');
    setButtonLoading(btn, true);

    try {
        const session = await apiRequest('/api/check-out', { method: 'POST' });
        clearInterval(timerInterval);
        activeSession = null;
        showCheckinUI();
        showToast(`Checked out! Duration: ${formatDuration(session.duration_minutes)}`, 'success');
        loadOccupancy();
        loadSessionHistory();
    } catch (err) {
        showToast(err.message || 'Check-out failed', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}


// ── Session History ────────────────────────────────────────

async function loadSessionHistory() {
    const container = document.getElementById('session-history-body');
    if (!container) return;

    try {
        const sessions = await apiRequest('/api/my-sessions?limit=10');

        if (!sessions.length) {
            container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No sessions yet. Check in to start tracking!</td></tr>`;
            return;
        }

        container.innerHTML = sessions.map(s => `
            <tr>
                <td>${formatDate(s.check_in)}</td>
                <td>${formatTime(s.check_in)}</td>
                <td>${s.check_out ? formatTime(s.check_out) : '<span class="badge badge-green">Active</span>'}</td>
                <td><span style="color: ${getWorkoutColor(s.workout_type)}">${getWorkoutIcon(s.workout_type)} ${s.workout_type}</span></td>
                <td class="stat-number">${s.duration_minutes ? formatDuration(s.duration_minutes) : '—'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load session history:', err);
    }
}


// ── Peak Hours Heatmap ─────────────────────────────────────

async function loadPeakHours() {
    const container = document.getElementById('peak-hours-chart');
    if (!container) return;

    try {
        const hours = await apiRequest('/api/analytics/peak-hours?days=30');

        if (!hours.length) {
            container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">Not enough data yet</p>`;
            return;
        }

        const maxVisitors = Math.max(...hours.map(h => h.avg_visitors)) || 1;

        // Show only gym hours (6 AM - 10 PM)
        const gymHours = hours.filter(h => h.hour >= 6 && h.hour <= 22);

        container.innerHTML = `
            <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                ${gymHours.map(h => {
                    const intensity = h.avg_visitors / maxVisitors;
                    const level = getOccupancyLevel(intensity * 100);
                    const opacity = Math.max(0.15, intensity);
                    return `
                        <div class="heatmap-cell" 
                             style="width: 52px; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${level.color}${Math.round(opacity * 40).toString(16).padStart(2, '0')}; border: 1px solid ${level.color}22;"
                             title="${formatHour(h.hour)}: ~${h.avg_visitors} visitors">
                            <span style="font-size: 0.7rem; color: var(--text-secondary);">${formatHour(h.hour)}</span>
                            <span class="stat-number" style="font-size: 0.85rem; color: ${level.color};">${h.avg_visitors}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display: flex; justify-content: center; gap: 16px; margin-top: 16px;">
                <span style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted);">
                    <span style="width: 10px; height: 10px; border-radius: 2px; background: var(--accent-green);"></span> Low
                </span>
                <span style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted);">
                    <span style="width: 10px; height: 10px; border-radius: 2px; background: var(--accent-amber);"></span> Moderate
                </span>
                <span style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted);">
                    <span style="width: 10px; height: 10px; border-radius: 2px; background: var(--accent-red);"></span> High
                </span>
            </div>
        `;
    } catch (err) {
        console.error('Failed to load peak hours:', err);
    }
}


// ── Cleanup ────────────────────────────────────────────────

window.addEventListener('beforeunload', () => {
    clearInterval(timerInterval);
    clearInterval(refreshInterval);
});
