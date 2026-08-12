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
        initPlanner(),
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

        // If user is admin, redirect to admin portal
        if (profile.role === 'admin') {
            window.location.href = 'admin.html';
            return;
        }

        // If pending QR check-in token exists, redirect to check-in page
        const pendingToken = sessionStorage.getItem('pending_qr_token');
        if (pendingToken) {
            window.location.href = `check-in.html?token=${encodeURIComponent(pendingToken)}`;
            return;
        }

        const nameEl = document.getElementById('user-name');
        const roleEl = document.getElementById('user-role');
        const welcomeEl = document.getElementById('welcome-heading');

        const fullName = profile.full_name || 'Student';
        if (nameEl) nameEl.textContent = `Hi, ${fullName}`;
        if (welcomeEl) welcomeEl.textContent = `Hi, ${fullName} 👋`;

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

async function checkGymOperationalStatus() {
    const supabase = window.SUPABASE_CLIENT;

    try {
        const { data: cfg } = await supabase.from('gym_config').select('*').eq('id', 1).single();
        if (cfg) {
            const isOpenToggle = cfg.is_open !== false;
            const openTime = cfg.open_time || '06:00';
            const closeTime = cfg.close_time || '22:00';

            const now = new Date();
            const istMs = now.getTime() + (5 * 60 + 30) * 60000;
            const istDate = new Date(istMs);
            const hours = String(istDate.getUTCHours()).padStart(2, '0');
            const mins = String(istDate.getUTCMinutes()).padStart(2, '0');
            const currentISTStr = `${hours}:${mins}`;

            let withinHours = true;
            if (openTime <= closeTime) {
                withinHours = (currentISTStr >= openTime && currentISTStr <= closeTime);
            } else {
                withinHours = (currentISTStr >= openTime || currentISTStr <= closeTime);
            }

            if (!isOpenToggle || !withinHours) {
                return {
                    isOpen: false,
                    reason: !isOpenToggle ? 'Gym is currently closed by administration.' : `Gym is currently closed. Operating hours are ${openTime} - ${closeTime}.`
                };
            }
        }
    } catch (e) {
        console.warn('checkGymOperationalStatus note:', e);
    }
    return { isOpen: true, reason: 'Open' };
}

function showCheckinUI() {
    const checkinPanel = document.getElementById('checkin-panel');
    const checkoutPanel = document.getElementById('checkout-panel');
    if (checkinPanel) checkinPanel.style.display = 'block';
    if (checkoutPanel) checkoutPanel.style.display = 'none';
    clearInterval(timerInterval);
    checkGymOperationalStatus();
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

// Max session duration before auto-checkout (set to 1 minute for testing, change to 120 for 2 hours)
const MAX_SESSION_MINUTES = 1;

function startTimer() {
    if (!activeSession) return;
    clearInterval(timerInterval);

    const update = () => {
        const checkInTime = parseUTC(activeSession.check_in).getTime();
        const elapsedMinutes = (Date.now() - checkInTime) / 60000;

        if (elapsedMinutes >= MAX_SESSION_MINUTES) {
            clearInterval(timerInterval);
            handleCheckOut(true);
            showToast(`⏰ Workout duration limit reached (${MAX_SESSION_MINUTES} min). Auto checked out!`, 'info');
            return;
        }

        const elapsed = getElapsedTime(activeSession.check_in);
        const timerEl = document.getElementById('session-timer');
        if (timerEl) timerEl.textContent = elapsed.display;
    };

    update();
    timerInterval = setInterval(update, 1000);
}

function setupWorkoutPills() {
    const pills = document.querySelectorAll('.workout-pill');
    const customContainer = document.getElementById('custom-workout-container');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            if (pill.dataset.type === 'Others') {
                if (customContainer) customContainer.style.display = 'block';
                document.getElementById('custom-workout-input')?.focus();
            } else {
                if (customContainer) customContainer.style.display = 'none';
            }
        });
    });
}

// ── HTML5 Camera QR Scanner & Check-In ────────────────────

let html5QrCodeScanner = null;
let pendingWorkoutType = null;

function openQRScannerModal(workoutType) {
    pendingWorkoutType = workoutType;
    const modal = document.getElementById('qr-scanner-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    document.getElementById('close-scanner-btn')?.addEventListener('click', closeQRScannerModal);
    document.getElementById('submit-manual-token-btn')?.addEventListener('click', handleManualTokenSubmit);

    // Start live camera scanner
    if (window.Html5Qrcode) {
        try {
            if (html5QrCodeScanner) {
                html5QrCodeScanner.stop().catch(() => {});
            }
            html5QrCodeScanner = new Html5Qrcode("qr-reader");
            html5QrCodeScanner.start(
                { facingMode: "environment" }, // Rear camera on mobile phone
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decodedText) => {
                    // Scanned token detected!
                    stopAndProcessToken(decodedText);
                },
                (err) => {}
            ).catch(err => {
                console.warn("Camera scanner start note:", err);
                showToast("Camera permission required or camera unavailable. You can enter the 12-char OTP token manually below.", "warning");
            });
        } catch (e) {
            console.error("Html5Qrcode init error:", e);
        }
    }
}

function stopAndProcessToken(scannedText) {
    let token = scannedText.trim();
    if (token.includes('token=')) {
        try {
            const u = new URL(token);
            token = u.searchParams.get('token') || token;
        } catch (e) {
            const match = token.match(/token=([a-zA-Z0-9]+)/);
            if (match) token = match[1];
        }
    }

    if (html5QrCodeScanner) {
        html5QrCodeScanner.stop().then(() => {
            html5QrCodeScanner = null;
            closeQRScannerModal();
            executeQRCheckIn(token, pendingWorkoutType);
        }).catch(() => {
            closeQRScannerModal();
            executeQRCheckIn(token, pendingWorkoutType);
        });
    } else {
        closeQRScannerModal();
        executeQRCheckIn(token, pendingWorkoutType);
    }
}

function handleManualTokenSubmit() {
    const input = document.getElementById('manual-token-input');
    const token = input ? input.value.trim() : '';
    if (!token) {
        showToast('Please enter the 12-character Entrance OTP Token', 'error');
        return;
    }
    stopAndProcessToken(token);
}

function closeQRScannerModal() {
    if (html5QrCodeScanner) {
        html5QrCodeScanner.stop().catch(() => {});
        html5QrCodeScanner = null;
    }
    const modal = document.getElementById('qr-scanner-modal');
    if (modal) modal.style.display = 'none';
}

async function executeQRCheckIn(qrToken, workoutType) {
    const btn = document.getElementById('checkin-btn');
    setButtonLoading(btn, true);

    try {
        const session = await apiRequest('/api/check-in', {
            method: 'POST',
            body: JSON.stringify({ workout_type: workoutType, qr_token: qrToken }),
        });

        sessionStorage.setItem('active_qr_token', qrToken);
        activeSession = session;
        showCheckoutUI();
        showToast(`Checked in! Training ${workoutType}`, 'success');
        loadOccupancy();
    } catch (err) {
        showToast(err.message || 'Entrance QR validation failed', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}

async function handleCheckIn() {
    const status = await checkGymOperationalStatus();
    if (!status.isOpen) {
        showToast(`⛔ ${status.reason}`, 'error');
        return;
    }

    const selected = document.querySelector('.workout-pill.active');
    if (!selected) {
        showToast('Please select a workout type', 'error');
        return;
    }

    let workoutType = selected.dataset.type;
    if (workoutType === 'Others') {
        const customInput = document.getElementById('custom-workout-input');
        const val = customInput ? customInput.value.trim() : '';
        if (!val) {
            showToast('Please type your custom workout details', 'error');
            return;
        }
        workoutType = val;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
        executeQRCheckIn(urlToken, workoutType);
    } else {
        // Always open live camera scanner modal on phone for every check-in!
        openQRScannerModal(workoutType);
    }
}

async function handleCheckOut() {
    const btn = document.getElementById('checkout-btn');
    setButtonLoading(btn, true);

    try {
        const session = await apiRequest('/api/check-out', { method: 'POST' });
        clearInterval(timerInterval);
        activeSession = null;
        
        // Clear stored QR tokens on check-out so next check-in ALWAYS demands a new QR scan!
        sessionStorage.removeItem('active_qr_token');
        sessionStorage.removeItem('pending_qr_token');
        
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
                             style="width: 52px; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${level.color}${Math.round(opacity * 40).toString(16).padStart(2, '0')}; border: 1px solid ${level.color}33;"
                             title="${formatHour(h.hour)}: ~${h.avg_visitors} visitors">
                            <span style="font-size: 0.7rem; color: var(--text-secondary);">${formatHour(h.hour)}</span>
                            <span class="stat-number" style="font-size: 0.85rem; color: ${level.color};">${h.avg_visitors}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 16px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                <span style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-secondary);">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #10b981;"></span> Low (0-30%)
                </span>
                <span style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-secondary);">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #f59e0b;"></span> Moderate (30-70%)
                </span>
                <span style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-secondary);">
                    <span style="width: 8px; height: 8px; border-radius: 2px; background: #f43f5e;"></span> High (70%+)
                </span>
            </div>
        `;
    } catch (err) {
        console.error('Failed to load peak hours:', err);
    }
}

// ── Smart Workout Planner & Crowd Forecast ─────────────────

const DAYS_ORDER = [
    { name: 'Monday', idx: 1 },
    { name: 'Tuesday', idx: 2 },
    { name: 'Wednesday', idx: 3 },
    { name: 'Thursday', idx: 4 },
    { name: 'Friday', idx: 5 },
    { name: 'Saturday', idx: 6 },
    { name: 'Sunday', idx: 0 },
];

const TIME_SLOTS = [
    { value: 6, label: '6:00 AM' },
    { value: 7, label: '7:00 AM' },
    { value: 8, label: '8:00 AM' },
    { value: 9, label: '9:00 AM' },
    { value: 10, label: '10:00 AM' },
    { value: 16, label: '4:00 PM' },
    { value: 17, label: '5:00 PM' },
    { value: 18, label: '6:00 PM' },
    { value: 19, label: '7:00 PM' },
    { value: 20, label: '8:00 PM' },
    { value: 21, label: '9:00 PM' },
];

async function initPlanner() {
    // Tab switching setup
    document.getElementById('tab-btn-planner')?.addEventListener('click', () => switchPlannerTab('plan'));
    document.getElementById('tab-btn-template')?.addEventListener('click', () => switchPlannerTab('template'));
    document.getElementById('tab-btn-forecast')?.addEventListener('click', () => switchPlannerTab('forecast'));

    // Plan form submit
    document.getElementById('plan-form')?.addEventListener('submit', handleSavePlan);

    // Set default forecast date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().split('T')[0];

    const dateInput = document.getElementById('plan-date-input');
    if (dateInput) dateInput.value = tomorrowIso;

    const forecastDateInput = document.getElementById('forecast-date-input');
    if (forecastDateInput) {
        forecastDateInput.value = tomorrowIso;
        forecastDateInput.addEventListener('change', loadCrowdForecast);
    }

    const forecastTimeSelect = document.getElementById('forecast-time-select');
    if (forecastTimeSelect) {
        forecastTimeSelect.addEventListener('change', loadCrowdForecast);
    }

    // Load initial schedule & template
    await loadMySchedule();
}

function switchPlannerTab(tabName) {
    const tabs = [
        { id: 'planner', key: 'plan' },
        { id: 'template', key: 'template' },
        { id: 'forecast', key: 'forecast' }
    ];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t.id}`);
        const content = document.getElementById(`planner-tab-${t.key}`);
        const isActive = (t.key === tabName);
        if (btn) btn.classList.toggle('active', isActive);
        if (content) content.style.display = isActive ? 'block' : 'none';
    });

    if (tabName === 'forecast') {
        loadCrowdForecast();
    }
}

async function loadMySchedule() {
    try {
        const data = await apiRequest('/api/planner/my-schedule');
        renderUpcomingPlans(data.plans || []);
        renderWeeklyTemplateGrid(data.templates || []);
    } catch (err) {
        console.error('Failed to load schedule:', err);
    }
}

function renderUpcomingPlans(plans) {
    const container = document.getElementById('upcoming-plans-list');
    if (!container) return;

    if (!plans.length) {
        container.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted); padding: 10px 0;">No upcoming date-specific plans. Use the form above to schedule!</p>`;
        return;
    }

    container.innerHTML = plans.map(p => `
        <div style="min-width: 140px; padding: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="font-weight: 600; font-size: 0.85rem; color: var(--accent-blue);">${formatDate(p.planned_date)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${formatHour(p.planned_time_slot)}</div>
                <div style="font-size: 0.9rem; font-weight: 600; margin-top: 6px;">${getWorkoutIcon(p.workout_type)} ${p.workout_type}</div>
            </div>
            <button onclick="deletePlan('${p.planned_date}')" style="background: none; border: none; color: var(--accent-red); font-size: 0.72rem; cursor: pointer; text-align: right; margin-top: 8px;">Delete</button>
        </div>
    `).join('');
}

async function handleSavePlan(e) {
    e.preventDefault();
    const dateVal = document.getElementById('plan-date-input')?.value;
    const timeVal = parseInt(document.getElementById('plan-time-select')?.value || 17);
    const workoutVal = document.getElementById('plan-workout-input')?.value;

    if (!dateVal || !workoutVal) {
        showToast('Please fill all fields', 'error');
        return;
    }

    try {
        await apiRequest('/api/planner/plan', {
            method: 'POST',
            body: JSON.stringify({
                planned_date: dateVal,
                planned_time_slot: timeVal,
                workout_type: workoutVal,
            }),
        });
        showToast(`Planned ${workoutVal} for ${formatDate(dateVal)}!`, 'success');
        document.getElementById('plan-workout-input').value = '';
        await loadMySchedule();
    } catch (err) {
        showToast(err.message || 'Failed to save plan', 'error');
    }
}

async function deletePlan(dateStr) {
    try {
        await apiRequest(`/api/planner/plan/${dateStr}`, { method: 'DELETE' });
        showToast('Plan removed', 'info');
        await loadMySchedule();
    } catch (err) {
        showToast('Failed to delete plan', 'error');
    }
}

function renderWeeklyTemplateGrid(templates) {
    const container = document.getElementById('weekly-template-grid');
    if (!container) return;

    const templateMap = {};
    templates.forEach(t => {
        templateMap[t.day_of_week] = t;
    });

    const gridHtml = DAYS_ORDER.map(d => {
        const item = templateMap[d.idx];
        const workout = item ? item.workout_type : '';
        const hour = item ? item.planned_time_slot : 17;

        const optionsHtml = TIME_SLOTS.map(s => 
            `<option value="${s.value}" ${hour === s.value ? 'selected' : ''}>${s.label}</option>`
        ).join('');

        return `
            <div style="padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;">
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${d.name}</div>
                <input type="text" id="tpl-input-${d.idx}" class="form-input" value="${workout}" placeholder="e.g. Push" style="width: 100%; font-size: 0.78rem; padding: 6px 8px; margin-bottom: 6px;">
                <select id="tpl-time-${d.idx}" class="form-input" style="width: 100%; font-size: 0.75rem; padding: 4px;">
                    ${optionsHtml}
                </select>
                <button onclick="saveTemplateDay(${d.idx})" class="btn-secondary" style="width: 100%; padding: 4px; font-size: 0.72rem; margin-top: 6px;">Save</button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 12px;">
            ${gridHtml}
        </div>
        <div style="text-align: right;">
            <button onclick="saveAllTemplates()" class="btn-primary" style="padding: 8px 16px; font-size: 0.82rem;">Save All Days</button>
        </div>
    `;
}

async function saveTemplateDay(dayIdx) {
    const workoutVal = document.getElementById(`tpl-input-${dayIdx}`)?.value.trim();
    const timeVal = parseInt(document.getElementById(`tpl-time-${dayIdx}`)?.value || 17);
    const dayObj = DAYS_ORDER.find(d => d.idx === dayIdx);
    const dayName = dayObj ? dayObj.name : 'Day';

    if (!workoutVal) {
        try {
            await apiRequest(`/api/planner/template/${dayIdx}`, { method: 'DELETE' });
            showToast(`Cleared ${dayName} template`, 'info');
            await loadMySchedule();
        } catch (e) {}
        return;
    }

    try {
        await apiRequest('/api/planner/template', {
            method: 'POST',
            body: JSON.stringify({
                day_of_week: dayIdx,
                planned_time_slot: timeVal,
                workout_type: workoutVal,
            }),
        });
        showToast(`Updated ${dayName} routine!`, 'success');
        await loadMySchedule();
    } catch (err) {
        showToast(err.message || 'Failed to save template', 'error');
    }
}

async function saveAllTemplates() {
    let count = 0;
    for (const d of DAYS_ORDER) {
        const workoutVal = document.getElementById(`tpl-input-${d.idx}`)?.value.trim();
        const timeVal = parseInt(document.getElementById(`tpl-time-${d.idx}`)?.value || 17);
        if (workoutVal) {
            try {
                await apiRequest('/api/planner/template', {
                    method: 'POST',
                    body: JSON.stringify({
                        day_of_week: d.idx,
                        planned_time_slot: timeVal,
                        workout_type: workoutVal,
                    }),
                });
                count++;
            } catch (e) {}
        }
    }
    showToast(`Saved weekly routine for ${count} days!`, 'success');
    await loadMySchedule();
}

async function loadCrowdForecast() {
    const dateVal = document.getElementById('forecast-date-input')?.value;
    const timeVal = document.getElementById('forecast-time-select')?.value || 17;

    if (!dateVal) return;

    try {
        const data = await publicApiRequest(`/api/planner/crowd-forecast?target_date=${dateVal}&hour=${timeVal}`);
        
        const countDisplay = document.getElementById('forecast-count-display');
        const subtext = document.getElementById('forecast-subtext');
        const breakdownList = document.getElementById('forecast-breakdown-list');

        const level = getOccupancyLevel(data.predicted_percentage);

        if (countDisplay) {
            countDisplay.textContent = `${data.predicted_count} / ${data.max_capacity}`;
            countDisplay.style.color = level.color;
        }

        if (subtext) {
            subtext.innerHTML = `<span class="badge" style="background: ${level.color}22; color: ${level.color};">● ${level.label} (${data.predicted_percentage}%)</span><br><span style="font-size: 0.75rem; margin-top: 4px; display: inline-block;">${data.planned_students_count} students pre-planned for ${formatHour(parseInt(timeVal))}</span>`;
        }

        if (breakdownList) {
            if (!data.workout_breakdown || !data.workout_breakdown.length) {
                breakdownList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem;">No specific workout focus recorded for this slot yet.</p>`;
            } else {
                breakdownList.innerHTML = data.workout_breakdown.map(b => `
                    <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span>${getWorkoutIcon(b.workout_type)} ${b.workout_type}</span>
                        <span class="stat-number" style="color: var(--accent-blue);">${b.count} student(s)</span>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Failed to load crowd forecast:', err);
    }
}

// Make functions globally available for inline onclick
window.switchPlannerTab = switchPlannerTab;
window.deletePlan = deletePlan;
window.saveTemplateDay = saveTemplateDay;
window.saveAllTemplates = saveAllTemplates;


// ── Cleanup ────────────────────────────────────────────────

window.addEventListener('beforeunload', () => {
    clearInterval(timerInterval);
    clearInterval(refreshInterval);
});
