import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/services/api/admin';
import { attendanceApi } from '@/services/api/attendance';
import { analyticsApi } from '@/services/api/analytics';
import { FacilityStatusPanel } from './FacilityStatusPanel';
import { TodaysSnapshot } from './TodaysSnapshot';
import { LiveSessionsPreview } from './LiveSessionsPreview';
import { QuickOperations } from './QuickOperations';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { exportToCSV, formatDate, formatTime } from '@/lib/utils';
import type { OccupancyResponse, AnalyticsSummary, GymSession } from '@/types';

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [sessions, setSessions] = useState<GymSession[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const loadTelemetryData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setLoading(true);
      const [occData, summaryData, sessionData] = await Promise.all([
        attendanceApi.getOccupancy(),
        analyticsApi.getSummary(),
        adminApi.getAllSessions(10),
      ]);

      setOccupancy(occData);
      setSummary(summaryData);
      setSessions(sessionData);
      setLastUpdated(new Date());
      setError(false);

      if (isManualRefresh) {
        showToast('Facility telemetry refreshed', 'info');
      }
    } catch (err) {
      console.error('[AdminOverview] Error loading overview data:', err);
      setError(true);
      if (isManualRefresh) {
        showToast('Failed to refresh facility telemetry', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;

    loadTelemetryData();

    // 60s auto-polling refresh interval with unmount cleanup
    const interval = setInterval(() => {
      if (isMounted) {
        loadTelemetryData();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadTelemetryData]);

  // Handle CSV Export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const allSess = await adminApi.getAllSessions(200);
      const exportData = allSess.map((s) => ({
        Name: s.full_name || '',
        'Roll Number': s.roll_number || '',
        'Check In': formatDate(s.check_in) + ' ' + formatTime(s.check_in),
        'Check Out': s.check_out ? formatDate(s.check_out) + ' ' + formatTime(s.check_out) : 'Active',
        'Workout Type': s.workout_type,
        'Duration (min)': s.duration_minutes || '',
      }));
      exportToCSV(exportData, `gym-attendance-${new Date().toISOString().split('T')[0]}.csv`);
      showToast('CSV report exported successfully', 'success');
    } catch (err) {
      console.error('[AdminOverview] Error exporting CSV:', err);
      showToast('Failed to export CSV report', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (error && !occupancy && !summary) {
    return (
      <div className="py-8">
        <ErrorState
          title="Unable to load gym overview"
          message="Your system access is active, but we could not establish a connection to the facility telemetry server."
          onRetry={() => loadTelemetryData(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Gym Overview
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time facility status, today's activity, active sessions, and operational controls.
        </p>
      </div>

      {/* Top Grid: Facility Status + Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FacilityStatusPanel
          occupancy={occupancy}
          loading={loading}
          error={error}
          onRefresh={() => loadTelemetryData(true)}
          lastUpdated={lastUpdated}
        />
        <TodaysSnapshot summary={summary} loading={loading} />
      </div>

      {/* Bottom Grid: Live Sessions Preview + Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        <LiveSessionsPreview
          sessions={sessions}
          loading={loading}
          onViewAll={() => navigate('/admin/attendance')}
        />
        <QuickOperations onExportCSV={handleExportCSV} exporting={exporting} />
      </div>
    </div>
  );
};
