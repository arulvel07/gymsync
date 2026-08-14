import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { attendanceApi } from '@/services/api/attendance';
import { plannerApi } from '@/services/api/planner';
import { useToast } from '@/components/ui/Toast';
import { ErrorState } from '@/components/ui/ErrorState';
import { getElapsedTime, parseUTC } from '@/lib/utils';
import { MAX_SESSION_MINUTES } from '@/lib/constants';
import type {
  OccupancyResponse,
  GymSession,
  WorkoutPlan,
  WorkoutTemplate,
} from '@/types';

// Subcomponents
import { DashboardGreeting } from './components/DashboardGreeting';
import { GymStatusPanel } from './components/GymStatusPanel';
import { CheckInPanel } from './components/CheckInPanel';
import { ActiveSessionPanel } from './components/ActiveSessionPanel';
import { PersonalActivityPanel } from './components/PersonalActivityPanel';
import { PlannerPreview } from './components/PlannerPreview';
import { CrowdForecastPreview } from './components/CrowdForecastPreview';
import { QRScannerModal } from './components/QRScannerModal';

export const StudentDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  // Data States
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [activeSession, setActiveSession] = useState<GymSession | null>(null);
  const [sessionTimer, setSessionTimer] = useState('00:00:00');
  const [history, setHistory] = useState<GymSession[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  // Workout Selection State
  const [selectedWorkout, setSelectedWorkout] = useState<string>('Chest');
  const [customWorkout, setCustomWorkout] = useState<string>('');

  // Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);

  // Core Data Loader
  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);

    try {
      const [occ, act, hist, sched] = await Promise.all([
        attendanceApi.getOccupancy(),
        attendanceApi.getActiveSession(),
        attendanceApi.getMySessions(10),
        plannerApi.getMySchedule(),
      ]);

      setOccupancy(occ);
      setActiveSession(act.active && act.session ? act.session : null);
      setHistory(hist || []);
      setPlans(sched.plans || []);
      setTemplates(sched.templates || []);
    } catch (err: any) {
      console.error('[StudentDashboard] Error loading data:', err);
      if (isInitial) {
        setError(err.message || 'Unable to connect to gym server');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(true);
    const interval = setInterval(() => loadDashboardData(false), 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // 120-Minute Session Timer & Auto-Checkout
  useEffect(() => {
    if (!activeSession) return;

    const updateTimer = () => {
      const checkInTime = parseUTC(activeSession.check_in).getTime();
      const elapsedMinutes = (Date.now() - checkInTime) / 60000;

      if (elapsedMinutes >= MAX_SESSION_MINUTES) {
        handleCheckOut(true);
        showToast(`Session limit reached (${MAX_SESSION_MINUTES} min). Auto checked out!`, 'info');
        return;
      }

      const elapsed = getElapsedTime(activeSession.check_in);
      setSessionTimer(elapsed.display);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Execute Check-in logic
  const executeCheckIn = async (qrToken?: string) => {
    const finalWorkout = selectedWorkout === 'Others' ? customWorkout.trim() : selectedWorkout;
    if (!finalWorkout) {
      showToast('Please specify a workout focus', 'error');
      return;
    }

    setCheckInLoading(true);
    try {
      const session = await attendanceApi.checkIn(finalWorkout, qrToken);
      setActiveSession(session);
      showToast(`Checked in! Training ${finalWorkout}`, 'success');
      loadDashboardData(false);
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckInClick = () => {
    const finalWorkout = selectedWorkout === 'Others' ? customWorkout.trim() : selectedWorkout;
    if (!finalWorkout) {
      showToast('Please specify a workout focus', 'error');
      return;
    }

    // Check if URL token exists (e.g. from entrance QR scan link)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      executeCheckIn(urlToken);
    } else {
      setScannerOpen(true);
    }
  };

  // Execute Check-out logic
  const handleCheckOut = async (isAuto = false) => {
    setCheckOutLoading(true);
    try {
      const session = await attendanceApi.checkOut();
      setActiveSession(null);
      showToast(`Checked out! Duration: ${session.duration_minutes ? `${session.duration_minutes}m` : 'Completed'}`, 'success');
      loadDashboardData(false);
    } catch (err: any) {
      if (!isAuto) showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Save Workout Plan
  const handleSavePlan = async (date: string, time: number, workout: string) => {
    try {
      await plannerApi.savePlan(date, time, workout);
      showToast(`Planned ${workout} for ${date}`, 'success');
      const res = await plannerApi.getMySchedule();
      setPlans(res.plans || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to save plan', 'error');
      throw err;
    }
  };

  // Delete Workout Plan
  const handleDeletePlan = async (date: string) => {
    try {
      await plannerApi.deletePlan(date);
      showToast('Plan removed', 'info');
      const res = await plannerApi.getMySchedule();
      setPlans(res.plans || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete plan', 'error');
    }
  };

  // Calculate today's planned workout
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayPlan = useMemo(() => {
    return plans.find((p) => p.planned_date === todayStr) || null;
  }, [plans, todayStr]);

  // Handle direct hash navigation e.g. #activity from bottom navigation
  useEffect(() => {
    if (window.location.hash === '#activity') {
      const timer = setTimeout(() => {
        const el = document.getElementById('activity');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (error && !occupancy) {
    return (
      <div className="py-12">
        <ErrorState
          title="Unable to load gym dashboard"
          message="Your account data is safe. We just couldn't reach the gym server."
          onRetry={() => loadDashboardData(true)}
        />
      </div>
    );
  }

  const isFull = occupancy ? occupancy.current_count >= occupancy.max_capacity : false;
  const isOpen = occupancy ? occupancy.is_open : true;

  return (
    <div className="space-y-6 pb-8">
      {/* Restrained Greeting */}
      <DashboardGreeting
        fullName={profile?.full_name}
        isOpen={isOpen}
        activeSession={!!activeSession}
      />

      {/* Primary operational grid: Gym Status + Check-in / Active Session */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 xl:col-span-5">
          <GymStatusPanel occupancy={occupancy} loading={loading} />
        </div>

        <div className="lg:col-span-7 xl:col-span-7">
          {!activeSession ? (
            <CheckInPanel
              selectedWorkout={selectedWorkout}
              onSelectWorkout={setSelectedWorkout}
              customWorkout={customWorkout}
              onCustomWorkoutChange={setCustomWorkout}
              onCheckInClick={handleCheckInClick}
              loading={checkInLoading}
              isOpen={isOpen}
              isFull={isFull}
              todayPlan={todayPlan}
            />
          ) : (
            <ActiveSessionPanel
              activeSession={activeSession}
              sessionTimer={sessionTimer}
              onCheckOut={() => handleCheckOut(false)}
              loading={checkOutLoading}
            />
          )}
        </div>
      </div>

      {/* Supporting insights row: Planner Preview & Crowd Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <PlannerPreview
          plans={plans}
          templates={templates}
          onSavePlan={handleSavePlan}
          onDeletePlan={handleDeletePlan}
          loading={loading}
        />
        <CrowdForecastPreview />
      </div>

      {/* Personal Activity Log & History Table */}
      <PersonalActivityPanel
        history={history}
        loading={loading}
        onCheckInRequest={handleCheckInClick}
      />

      {/* QR Code Scanner & OTP Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onTokenSubmit={(token) => executeCheckIn(token)}
        onCameraNotice={(msg) => showToast(msg, 'info')}
      />
    </div>
  );
};
