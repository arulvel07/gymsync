/**
 * Admin Dashboard Logic
 * Analytics charts, attendance management, gym config, CSV export
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
        document.getElementById('admin-name').textContent = profile.full_name;
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

    // Setup sidebar navigation
    setupSidebarNav();

    // Setup event listeners
    document.getElementById('config-form')?.addEventListener('submit', handleUpdateConfig);
    document.getElementById('export-csv-btn')?.addEventListener('click', handleExportCSV);
    document.getElementById('attendance-search')?.addEventListener('input', debounce(handleAttendanceSearch, 300));
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Auto-refresh every 60 seconds
    setInterval(() => {
        loadAdminSummary();
        loadAdminOccupancy();
    }, 60000);
}


// ── Sidebar Navigation ─────────────────────────────────────

function setupSidebarNav() {
    const links = document.querySelectorAll('.sidebar-link[data-section]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(section) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(s => {
        s.style.display = s.id === `section-${section}` ? 'block' : 'none';
    });
    currentAdminSection = section;
}


// ── Summary Cards ──────────────────────────────────────────

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
        document.getElementById('admin-occupancy-count').textContent = data.current_count;
        document.getElementById('admin-occupancy-max').textContent = `/ ${data.max_capacity}`;
        const pctEl = document.getElementById('admin-occupancy-pct');
        pctEl.textContent = `${data.percentage}%`;
        pctEl.style.color = level.color;
    } catch (err) {
        console.error('Failed to load occupancy:', err);
    }
}


// ── Attendance Log ─────────────────────────────────────────

async function loadAttendanceLog(search = '') {
    const tbody = document.getElementById('attendance-tbody');
    if (!tbody) return;

    try {
        let url = '/api/admin/all-sessions?limit=50';
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const dateFrom = document.getElementById('date-from')?.value;
        const dateTo = document.getElementById('date-to')?.value;
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;

        const sessions = await apiRequest(url);

        if (!sessions.length) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No sessions found</td></tr>`;
            return;
        }

        tbody.innerHTML = sessions.map(s => `
            <tr>
                <td style="color: var(--text-primary); font-weight: 500;">${s.full_name || '—'}</td>
                <td><span class="stat-number" style="font-size: 0.85rem;">${s.roll_number || '—'}</span></td>
                <td>${formatDate(s.check_in)}</td>
                <td>${formatTime(s.check_in)}</td>
                <td>${s.check_out ? formatTime(s.check_out) : '<span class="badge badge-green">Active</span>'}</td>
                <td><span style="color: ${getWorkoutColor(s.workout_type)}">${getWorkoutIcon(s.workout_type)} ${s.workout_type}</span></td>
                <td class="stat-number">${s.duration_minutes ? formatDuration(s.duration_minutes) : '—'}</td>
            </tr>
        `).join('');
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
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
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
                        return level.color + '80';
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
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(148, 163, 184, 0.05)' },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 11 }, maxRotation: 45 },
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.05)' },
                ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
                beginAtZero: true,
                title: {
                    display: true,
                    text: yLabel,
                    color: '#64748b',
                    font: { family: 'Inter', size: 12 },
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
        showToast('CSV exported successfully', 'success');
    } catch (err) {
        showToast('Failed to export CSV', 'error');
    }
}


// ── Utility ────────────────────────────────────────────────

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
