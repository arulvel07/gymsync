/**
 * Admin Dashboard Logic
 * Executive command center, analytics charts, attendance management, gym config, CSV export
 */

let currentAdminSection = 'overview';

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

async function initAdmin() {
    const session = await requireAuth();
    if (!session) return;

    // Verify admin role
    try {
        const profile = await apiRequest('/api/profile');
        if (profile.role !== 'admin') {
            showToast('Admin access required', 'error');
            window.location.href = 'dashboard.html';
            return;
        }
        document.getElementById('admin-name').textContent = profile.full_name || profile.roll_number || 'Administrator';
    } catch (err) {
        showToast('Failed to verify admin access', 'error');
        window.location.href = 'dashboard.html';
        return;
    }

    // Load all admin data
    await Promise.all([
        loadAdminSummary(),
        loadAdminOccupancy(),
        loadAttendanceLog(),
        loadDailyChart(),
        loadHourlyChart(),
        loadWorkoutPieChart(),
        loadGymConfig(),
    ]);

    // Setup sidebar & mobile navigation
    setupSidebarNav();

    // Setup event listeners
    document.getElementById('config-form')?.addEventListener('submit', handleUpdateConfig);
    document.getElementById('export-csv-btn')?.addEventListener('click', handleExportCSV);
    document.getElementById('rotate-qr-btn')?.addEventListener('click', () => loadAdminQRToken(true));
    document.getElementById('attendance-search')?.addEventListener('input', debounce(handleAttendanceSearch, 300));
    document.getElementById('date-from')?.addEventListener('change', () => loadAttendanceLog());
    document.getElementById('date-to')?.addEventListener('change', () => loadAttendanceLog());
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Auto-refresh every 60 seconds
    setInterval(() => {
        loadAdminSummary();
        loadAdminOccupancy();
        if (currentAdminSection === 'overview' || currentAdminSection === 'attendance') {
            loadAttendanceLog();
        }
    }, 60000);
}


// ── Sidebar & Navigation ───────────────────────────────────

function setupSidebarNav() {
    const allLinks = document.querySelectorAll('.sidebar-link[data-section], .admin-mobile-link[data-section]');
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });
}

function showSection(section) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(s => {
        s.style.display = s.id === `section-${section}` ? 'block' : 'none';
    });

    const allLinks = document.querySelectorAll('.sidebar-link[data-section], .admin-mobile-link[data-section]');
    allLinks.forEach(l => {
        if (l.dataset.section === section) {
            l.classList.add('active');
        } else {
            l.classList.remove('active');
        }
    });

    currentAdminSection = section;
    if (section === 'qr-code') {
        loadAdminQRToken();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ── Summary Cards & Telemetry ──────────────────────────────

async function loadAdminSummary() {
    try {
        const data = await apiRequest('/api/analytics/summary');
        document.getElementById('stat-today').textContent = data.total_visits_today;
        document.getElementById('stat-week').textContent = data.total_visits_week;
        document.getElementById('stat-month').textContent = data.total_visits_month;
        document.getElementById('stat-avg-duration').textContent = `${data.avg_duration_minutes}m`;
        document.getElementById('stat-peak-hour').textContent = formatHour(data.peak_hour);
        document.getElementById('stat-unique-today').textContent = data.unique_users_today;
    } catch (err) {
        console.error('Failed to load admin summary:', err);
    }
}

async function loadAdminOccupancy() {
    try {
        const data = await publicApiRequest('/api/occupancy');
        const level = getOccupancyLevel(data.percentage);

        const countEl = document.getElementById('admin-occupancy-count');
        if (countEl) {
            countEl.textContent = data.current_count;
            countEl.style.color = level.color;
        }

        const maxEl = document.getElementById('admin-occupancy-max');
        if (maxEl) maxEl.textContent = `/ ${data.max_capacity} Max Capacity`;

        const pctEl = document.getElementById('admin-occupancy-pct');
        if (pctEl) {
            pctEl.textContent = `${data.percentage}%`;
            pctEl.style.color = level.color;
        }

        const barEl = document.getElementById('admin-occupancy-bar');
        if (barEl) {
            barEl.style.width = `${Math.min(100, data.percentage)}%`;
            barEl.style.background = level.color;
        }

        const labelEl = document.getElementById('admin-capacity-label');
        if (labelEl) {
            labelEl.textContent = data.is_open ? level.label : 'Gym Closed';
            labelEl.style.color = level.color;
        }

        const badgeEl = document.getElementById('admin-status-badge');
        if (badgeEl) {
            if (!data.is_open) {
                badgeEl.className = 'badge badge-red';
                badgeEl.textContent = '● Facility Closed';
            } else if (data.percentage >= 90) {
                badgeEl.className = 'badge badge-red';
                badgeEl.textContent = '● Almost Full';
            } else {
                badgeEl.className = 'badge badge-green';
                badgeEl.textContent = '● Operational';
            }
        }
    } catch (err) {
        console.error('Failed to load occupancy:', err);
    }
}


// ── Attendance Log ─────────────────────────────────────────

async function loadAttendanceLog(search = '') {
    const tbody = document.getElementById('attendance-tbody');
    const overviewTbody = document.getElementById('overview-attendance-tbody');

    try {
        let url = '/api/admin/all-sessions?limit=50';
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const dateFrom = document.getElementById('date-from')?.value;
        const dateTo = document.getElementById('date-to')?.value;
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;

        const sessions = await apiRequest(url);

        const rowHtml = (s) => `
            <tr>
                <td style="color: var(--text-primary); font-weight: 600;">${s.full_name || 'Student'}</td>
                <td><span class="stat-number" style="font-size: 0.85rem; color: var(--accent-blue);">${s.roll_number || '—'}</span></td>
                <td>${formatDate(s.check_in)}</td>
                <td>${formatTime(s.check_in)}</td>
                <td>${s.check_out ? formatTime(s.check_out) : '<span class="badge badge-green">● Active</span>'}</td>
                <td><span style="color: ${getWorkoutColor(s.workout_type)}">${getWorkoutIcon(s.workout_type)} ${s.workout_type}</span></td>
                <td class="stat-number">${s.duration_minutes ? formatDuration(s.duration_minutes) : '—'}</td>
            </tr>
        `;

        if (!sessions.length) {
            const emptyHtml = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No session records found</td></tr>`;
            if (tbody) tbody.innerHTML = emptyHtml;
            if (overviewTbody) overviewTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No recent sessions recorded today</td></tr>`;
            return;
        }

        if (tbody) {
            tbody.innerHTML = sessions.map(rowHtml).join('');
        }

        if (overviewTbody) {
            overviewTbody.innerHTML = sessions.slice(0, 5).map(s => `
                <tr>
                    <td style="color: var(--text-primary); font-weight: 600;">${s.full_name || 'Student'}</td>
                    <td><span class="stat-number" style="font-size: 0.85rem; color: var(--accent-blue);">${s.roll_number || '—'}</span></td>
                    <td>${formatTime(s.check_in)}</td>
                    <td>${s.check_out ? formatTime(s.check_out) : '<span class="badge badge-green">● Active</span>'}</td>
                    <td><span style="color: ${getWorkoutColor(s.workout_type)}">${getWorkoutIcon(s.workout_type)} ${s.workout_type}</span></td>
                    <td class="stat-number">${s.duration_minutes ? formatDuration(s.duration_minutes) : '—'}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load attendance log:', err);
    }
}

function handleAttendanceSearch(e) {
    loadAttendanceLog(e.target.value);
}


// ── Charts (using Chart.js) ────────────────────────────────

async function loadDailyChart() {
    const canvas = document.getElementById('daily-chart');
    if (!canvas) return;

    try {
        const data = await apiRequest('/api/analytics/daily-stats?days=30');
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                }),
                datasets: [{
                    label: 'Daily Visitors',
                    data: data.map(d => d.count),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#3b82f6',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                }],
            },
            options: getChartOptions('Visitors'),
        });
    } catch (err) {
        console.error('Failed to load daily chart:', err);
    }
}

async function loadHourlyChart() {
    const canvas = document.getElementById('hourly-chart');
    if (!canvas) return;

    try {
        const data = await apiRequest('/api/analytics/peak-hours?days=30');
        const gymHours = data.filter(h => h.hour >= 6 && h.hour <= 22);
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: gymHours.map(h => formatHour(h.hour)),
                datasets: [{
                    label: 'Avg Visitors',
                    data: gymHours.map(h => h.avg_visitors),
                    backgroundColor: gymHours.map(h => {
                        const maxVal = Math.max(...gymHours.map(x => x.avg_visitors)) || 1;
                        const level = getOccupancyLevel((h.avg_visitors / maxVal) * 100);
                        return level.color + '90';
                    }),
                    borderColor: gymHours.map(h => {
                        const maxVal = Math.max(...gymHours.map(x => x.avg_visitors)) || 1;
                        const level = getOccupancyLevel((h.avg_visitors / maxVal) * 100);
                        return level.color;
                    }),
                    borderWidth: 1,
                    borderRadius: 6,
                }],
            },
            options: getChartOptions('Avg Visitors'),
        });
    } catch (err) {
        console.error('Failed to load hourly chart:', err);
    }
}

async function loadWorkoutPieChart() {
    const canvas = document.getElementById('workout-pie-chart');
    if (!canvas) return;

    try {
        const data = await apiRequest('/api/analytics/workout-distribution?days=30');
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.workout_type),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: data.map(d => getWorkoutColor(d.workout_type) + 'CC'),
                    borderColor: data.map(d => getWorkoutColor(d.workout_type)),
                    borderWidth: 2,
                    hoverOffset: 8,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 12 },
                            padding: 16,
                            usePointStyle: true,
                            pointStyleWidth: 10,
                        },
                    },
                },
            },
        });
    } catch (err) {
        console.error('Failed to load workout chart:', err);
    }
}

function getChartOptions(yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(148, 163, 184, 0.06)' },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, maxRotation: 45 },
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.06)' },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
                beginAtZero: true,
                title: {
                    display: true,
                    text: yLabel,
                    color: '#64748b',
                    font: { family: 'Inter', size: 11 },
                },
            },
        },
    };
}


// ── Gym Config ─────────────────────────────────────────────

async function loadGymConfig() {
    try {
        const config = await apiRequest('/api/admin/config');
        document.getElementById('config-capacity').value = config.max_capacity;
        document.getElementById('config-open-time').value = config.open_time?.substring(0, 5) || '06:00';
        document.getElementById('config-close-time').value = config.close_time?.substring(0, 5) || '22:00';
        document.getElementById('config-is-open').checked = config.is_open;
    } catch (err) {
        console.error('Failed to load config:', err);
    }
}

async function handleUpdateConfig(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(btn, true);

    try {
        const updates = {
            max_capacity: parseInt(document.getElementById('config-capacity').value),
            open_time: document.getElementById('config-open-time').value,
            close_time: document.getElementById('config-close-time').value,
            is_open: document.getElementById('config-is-open').checked,
        };

        await apiRequest('/api/admin/config', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });

        showToast('Gym configuration updated', 'success');
        loadAdminOccupancy();
    } catch (err) {
        showToast(err.message || 'Failed to update config', 'error');
    } finally {
        setButtonLoading(btn, false);
    }
}


// ── CSV Export ──────────────────────────────────────────────

async function handleExportCSV() {
    try {
        const sessions = await apiRequest('/api/admin/all-sessions?limit=200');
        const exportData = sessions.map(s => ({
            Name: s.full_name || '',
            'Roll Number': s.roll_number || '',
            'Check In': s.check_in ? new Date(s.check_in).toLocaleString('en-IN') : '',
            'Check Out': s.check_out ? new Date(s.check_out).toLocaleString('en-IN') : 'Active',
            'Workout Type': s.workout_type,
            'Duration (min)': s.duration_minutes || '',
        }));
        exportToCSV(exportData, `gym-attendance-${new Date().toISOString().split('T')[0]}.csv`);
        showToast('CSV report exported successfully', 'success');
    } catch (err) {
        showToast('Failed to export CSV', 'error');
    }
}


// ── Dynamic Entrance QR Code ───────────────────────────────

let qrTimerInterval = null;
let qrExpiresAtMs = 0;

async function loadAdminQRToken(forceRotate = false) {
    try {
        const endpoint = forceRotate ? '/api/admin/qr-token/rotate' : '/api/admin/qr-token';
        const method = forceRotate ? 'POST' : 'GET';
        const data = await apiRequest(endpoint, { method });

        if (!data || !data.token) return;

        // Build target scan URL for students
        const scanUrl = window.location.origin + '/check-in.html?token=' + data.token;

        const urlTextEl = document.getElementById('qr-url-text');
        if (urlTextEl) urlTextEl.textContent = scanUrl;

        const otpDisplay = document.getElementById('admin-otp-display');
        if (otpDisplay) otpDisplay.textContent = data.token;

        // Render Python-generated QR Code image
        const container = document.getElementById('admin-qr-container');
        if (container) {
            container.innerHTML = '';
            if (data.qr_image) {
                container.innerHTML = `<img src="${data.qr_image}" alt="Entrance Check-In QR Code" style="width:260px; height:260px; border-radius: 8px; display: block; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
            } else {
                const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(scanUrl)}`;
                container.innerHTML = `<img src="${fallbackUrl}" alt="Entrance Check-In QR Code" style="width:260px; height:260px; border-radius: 8px; display: block; margin: 0 auto;" />`;
            }
        }

        // Expiration calculation
        const expiresDate = new Date(data.expires_at.replace("Z", "+00:00"));
        qrExpiresAtMs = expiresDate.getTime();

        startQRCountdown();
    } catch (err) {
        console.error('Failed to load admin QR token:', err);
    }
}

function startQRCountdown() {
    clearInterval(qrTimerInterval);

    const updateTimer = () => {
        const now = Date.now();
        const diffMs = qrExpiresAtMs - now;

        const timerDisplay = document.getElementById('qr-timer-display');

        if (diffMs <= 0) {
            if (timerDisplay) {
                timerDisplay.textContent = 'QR expires in: 00:00';
                timerDisplay.style.color = 'var(--accent-rose)';
            }
            clearInterval(qrTimerInterval);
            // Automatically generate & display new QR code without page refresh!
            loadAdminQRToken(true);
            return;
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        const displayStr = `QR expires in: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (timerDisplay) {
            timerDisplay.textContent = displayStr;
            if (totalSeconds < 60) {
                timerDisplay.style.color = 'var(--accent-rose)';
            } else if (totalSeconds < 180) {
                timerDisplay.style.color = 'var(--accent-amber)';
            } else {
                timerDisplay.style.color = 'var(--accent-emerald)';
            }
        }
    };

    updateTimer();
    qrTimerInterval = setInterval(updateTimer, 1000);
}


// ── Utility Helpers ────────────────────────────────────────

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

window.showSection = showSection;
window.loadAdminSummary = loadAdminSummary;
window.loadAdminOccupancy = loadAdminOccupancy;
window.handleExportCSV = handleExportCSV;
window.loadAdminQRToken = loadAdminQRToken;
