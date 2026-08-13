/**
 * Student Dynamic Entrance QR Check-In Logic
 */

let activeToken = null;

document.addEventListener('DOMContentLoaded', () => {
    initQRCheckIn();
});

async function initQRCheckIn() {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get('token');

    // Check if token was saved in sessionStorage prior to login
    if (!token) {
        token = sessionStorage.getItem('pending_qr_token');
    }

    if (!token) {
        showExpiredState('❌ No QR Token Provided. Please scan the QR code at the gym entrance.');
        return;
    }

    activeToken = token;

    // Validate token with backend
    try {
        const valRes = await publicApiRequest(`/api/qr-tokens/validate?token=${encodeURIComponent(token)}`);

        if (!valRes || !valRes.valid) {
            showExpiredState(valRes?.message || '❌ QR Code Expired. Please scan the latest QR displayed at the gym.');
            return;
        }
    } catch (err) {
        showExpiredState('❌ QR Code Expired. Please scan the latest QR displayed at the gym.');
        return;
    }

    // Token is valid — now ensure student is authenticated
    try {
        const session = await requireAuth();
        if (!session) {
            // Save token so post-login returns to check-in flow
            sessionStorage.setItem('pending_qr_token', token);
            return;
        }
    } catch (e) {
        sessionStorage.setItem('pending_qr_token', token);
        window.location.href = 'login.html';
        return;
    }

    // Student is authenticated & token is valid! Clear pending token
    sessionStorage.removeItem('pending_qr_token');

    // Check if user already has an active session
    try {
        const activeRes = await apiRequest('/api/active-session');
        if (activeRes.active) {
            showToast('You already have an active gym session!', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            return;
        }
    } catch (e) {}

    // Show valid check-in screen
    showValidCheckInUI();
}

function showExpiredState(msg) {
    document.getElementById('qr-loading-card').style.display = 'none';
    document.getElementById('qr-valid-card').style.display = 'none';
    document.getElementById('qr-success-card').style.display = 'none';

    const expiredCard = document.getElementById('qr-expired-card');
    const msgEl = document.getElementById('qr-expired-message');

    if (msgEl) msgEl.textContent = msg;
    if (expiredCard) expiredCard.style.display = 'block';
}

function showValidCheckInUI() {
    document.getElementById('qr-loading-card').style.display = 'none';
    document.getElementById('qr-expired-card').style.display = 'none';
    document.getElementById('qr-success-card').style.display = 'none';

    const validCard = document.getElementById('qr-valid-card');
    if (validCard) validCard.style.display = 'block';

    setupWorkoutPills();

    document.getElementById('confirm-qr-checkin-btn')?.addEventListener('click', handleConfirmCheckIn);
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

async function handleConfirmCheckIn() {
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
            showToast('Please specify your custom workout', 'error');
            return;
        }
        workoutType = val;
    }

    const btn = document.getElementById('confirm-qr-checkin-btn');
    setButtonLoading(btn, true);

    try {
        const session = await apiRequest('/api/check-in', {
            method: 'POST',
            body: JSON.stringify({
                workout_type: workoutType,
                qr_token: activeToken,
            }),
        });

        document.getElementById('qr-valid-card').style.display = 'none';
        
        const successCard = document.getElementById('qr-success-card');
        const workoutText = document.getElementById('success-workout-text');
        
        if (workoutText) workoutText.textContent = `Training Focus: ${workoutType}`;
        if (successCard) successCard.style.display = 'block';

        showToast(`Checked in! Training ${workoutType}`, 'success');
    } catch (err) {
        showToast(err.message || 'Check-in failed', 'error');
        if (err.message && err.message.includes('Expired')) {
            showExpiredState(err.message);
        }
    } finally {
        setButtonLoading(btn, false);
    }
}
