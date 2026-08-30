import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/services/api/admin';
import { attendanceApi } from '@/services/api/attendance';
import { analyticsApi } from '@/services/api/analytics';
import { FacilityStatusPanel } from './FacilityStatusPanel';
import { TodaysSnapshot } from './TodaysSnapshot';
import { LiveSessionsPreview } from './LiveSessionsPreview';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { exportToCSV, formatDate, formatTime } from '@/lib/utils';
import type { OccupancyResponse, AnalyticsSummary, GymSession } from '@/types';
import { Download } from 'lucide-react';

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

  const loadOverviewData = useCallback(async (isManualRefresh = false) => {
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
        showToast('Gym overview refreshed', 'info');
      }
    } catch (err) {
      console.error('[AdminOverview] Error loading overview data:', err);
      setError(true);
      if (isManualRefresh) {
        showToast('Failed to refresh gym overview', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;

    loadOverviewData();

    // 60s auto-polling refresh interval with unmount cleanup
    const interval = setInterval(() => {
      if (isMounted) {
        loadOverviewData();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadOverviewData]);

  // Handle CSV Export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const allSess = await adminApi.getAllSessions(200);
      if (!allSess.length) {
        showToast('No attendance records found to export', 'warning');
        return;
      }
      const exportData = allSess.map((s) => ({
        Name: s.full_name || '',
        'Roll Number': s.roll_number || '',
        'Check In': formatDate(s.check_in) + ' ' + formatTime(s.check_in),
        'Check Out': s.check_out ? formatDate(s.check_out) + ' ' + formatTime(s.check_out) : 'Active',
        'Workout Type': s.workout_type,
        'Duration (min)': s.duration_minutes !== null && s.duration_minutes !== undefined ? s.duration_minutes : '',
      }));
      const exported = exportToCSV(exportData, `gym-attendance-${new Date().toISOString().split('T')[0]}.csv`);
      if (exported) {
        showToast(`Attendance report (${exportData.length} records) exported successfully`, 'success');
      }
    } catch (err: any) {
      console.error('[AdminOverview] Error exporting CSV:', err);
      showToast(err?.message || 'Failed to export attendance report', 'error');
    } finally {
      setExporting(false);
    }
  };


  if (error && !occupancy && !summary) {
    return (
      <div className="py-8">
        <ErrorState
          title="WE COULDN'T LOAD GYM OVERVIEW"
          message="Your data is safe. We just couldn't reach the gym server."
          onRetry={() => loadOverviewData(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Gym Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Live gym status, today's activity, and active sessions.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="self-start sm:self-auto gap-1.5 text-xs shrink-0"
          onClick={handleExportCSV}
          loading={exporting}
          iconLeft={<Download size={14} />}
        >
          Export Attendance
        </Button>
      </div>

      {/* Top Grid: Facility Status + Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FacilityStatusPanel
          occupancy={occupancy}
          loading={loading}
          error={error}
          onRefresh={() => loadOverviewData(true)}
          lastUpdated={lastUpdated}
        />
        <TodaysSnapshot summary={summary} loading={loading} />
      </div>

      {/* Full-width Live Sessions Preview */}
      <LiveSessionsPreview
        sessions={sessions}
        loading={loading}
        onViewAll={() => navigate('/admin/attendance')}
      />
    </div>
  );
};
