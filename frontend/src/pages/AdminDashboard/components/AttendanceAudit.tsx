import React, { useEffect, useState, useMemo } from 'react';
import { adminApi } from '@/services/api/admin';
import type { GymSession } from '@/types';
import { WORKOUT_TYPES } from '@/lib/constants';
import { formatDate, formatTime, formatDuration, exportToCSV } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { SessionDetailModal } from './SessionDetailModal';
import { Download, Search, X, Eye, Filter, Calendar, Clock, Dumbbell, Activity, RefreshCw } from 'lucide-react';

export const AttendanceAudit: React.FC = () => {
  const { showToast } = useToast();

  // State
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [workoutFilter, setWorkoutFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected session for detail modal
  const [selectedSession, setSelectedSession] = useState<GymSession | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch session data from API when server-side params change
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllSessions(100, 0, debouncedSearch, dateFrom, dateTo);
      setSessions(data);
    } catch (err: any) {
      console.error('[Attendance] Error fetching sessions:', err);
      setError(err?.message || 'Failed to connect to gym server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [debouncedSearch, dateFrom, dateTo]);

  // Client-side filtering for workout focus & session status
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Workout Filter
      if (workoutFilter !== 'all' && s.workout_type !== workoutFilter) {
        return false;
      }
      // Status Filter
      if (statusFilter === 'active' && s.check_out !== null) {
        return false;
      }
      if (statusFilter === 'completed' && s.check_out === null) {
        return false;
      }
      return true;
    });
  }, [sessions, workoutFilter, statusFilter]);

  // Summary Metrics calculated from filtered sessions
  const summaryMetrics = useMemo(() => {
    const total = filteredSessions.length;
    const active = filteredSessions.filter((s) => !s.check_out).length;
    const completed = filteredSessions.filter((s) => s.check_out !== null);
    const completedCount = completed.length;
    
    let avgDuration = 0;
    if (completedCount > 0) {
      const totalMinutes = completed.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      avgDuration = Math.round(totalMinutes / completedCount);
    }

    return {
      total,
      active,
      completed: completedCount,
      avgDuration,
    };
  }, [filteredSessions]);

  // Handle CSV Export preserving exact previous dataset and format
  const handleCSVExport = async () => {
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
      showToast('Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Reset all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setDateFrom('');
    setDateTo('');
    setWorkoutFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = Boolean(
    searchInput || dateFrom || dateTo || workoutFilter !== 'all' || statusFilter !== 'all'
  );

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="text-[0.7rem] uppercase tracking-wider text-blue-400 font-bold mb-1">
            Audit & Compliance
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#fafafa]">Attendance</h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">Review and export gym activity records.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchSessions}
            iconLeft={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            aria-label="Refresh attendance data"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCSVExport}
            loading={exporting}
            iconLeft={<Download className="w-3.5 h-3.5" />}
            aria-label="Export attendance to CSV file"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Controls & Filters Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <label htmlFor="attendance-search" className="block text-[0.68rem] uppercase tracking-wider font-semibold text-[#71717a] mb-1">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="attendance-search"
                type="text"
                placeholder="Name or roll number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#121215] border border-white/10 rounded-md text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
                  aria-label="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Date From */}
          <div>
            <label htmlFor="date-from" className="block text-[0.68rem] uppercase tracking-wider font-semibold text-[#71717a] mb-1">
              From Date
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-[#121215] border border-white/10 rounded-md text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Date To */}
          <div>
            <label htmlFor="date-to" className="block text-[0.68rem] uppercase tracking-wider font-semibold text-[#71717a] mb-1">
              To Date
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-[#121215] border border-white/10 rounded-md text-xs text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Workout Filter */}
          <div>
            <Select
              id="workout-filter"
              label="Workout Focus"
              value={workoutFilter}
              onChange={(e) => setWorkoutFilter(e.target.value)}
              options={[
                { label: 'All Workouts', value: 'all' },
                ...WORKOUT_TYPES.map((w) => ({ label: w, value: w })),
              ]}
              className="text-xs"
            />
          </div>
        </div>

        {/* Secondary Filter Row: Status & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Session Status', value: 'all' },
                  { label: 'Active Now', value: 'active' },
                  { label: 'Completed', value: 'completed' },
                ]}
                className="text-xs"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                iconLeft={<X className="w-3.5 h-3.5" />}
                className="text-xs text-[#a1a1aa] hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Records count indicator */}
          <div className="text-xs text-[#71717a]">
            Showing <span className="font-mono text-[#fafafa] font-semibold">{filteredSessions.length}</span> records
          </div>
        </div>
      </Card>

      {/* Summary Telemetry Strip */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#71717a]">Total Records</span>
            <span className="text-lg font-bold font-mono text-[#fafafa] mt-1">{summaryMetrics.total}</span>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#71717a]">Active Sessions</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1">{summaryMetrics.active}</span>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#71717a]">Completed Sessions</span>
            <span className="text-lg font-bold font-mono text-[#a1a1aa] mt-1">{summaryMetrics.completed}</span>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col">
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[#71717a]">Avg Duration</span>
            <span className="text-lg font-bold font-mono text-cyan-400 mt-1">
              {summaryMetrics.avgDuration ? formatDuration(summaryMetrics.avgDuration) : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area: Loading / Error / Empty / Data Table / Cards */}
      {loading ? (
        <Card className="p-6">
          <SkeletonTable rows={5} />
        </Card>
      ) : error ? (
        <ErrorState
          title="WE COULDN'T LOAD ATTENDANCE"
          message={error}
          onRetry={fetchSessions}
        />
      ) : filteredSessions.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title={hasActiveFilters ? 'NO ATTENDANCE FOUND' : 'NO ATTENDANCE RECORDS'}
            description={
              hasActiveFilters
                ? 'No session records matched your search or active filters.'
                : 'There are no gym session records recorded yet.'
            }
            primaryAction={
              hasActiveFilters ? (
                <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table Presentation (Visible on md/lg screens) */}
          <div className="hidden md:block">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#18181c] border-b border-white/10 text-[#71717a] uppercase tracking-wider font-semibold text-[0.68rem]">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4">Workout</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSessions.map((session) => {
                      const isActive = !session.check_out;

                      return (
                        <tr
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedSession(session);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View session details for ${session.full_name || 'Student'}`}
                          className="hover:bg-white/[0.02] focus:bg-white/[0.04] focus:outline-none transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-semibold text-[#fafafa]">
                            {session.full_name || 'Student'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#a1a1aa]">
                            {session.roll_number || '—'}
                          </td>
                          <td className="py-3 px-4 text-[#a1a1aa]">
                            {formatDate(session.check_in)}
                          </td>
                          <td className="py-3 px-4 text-[#fafafa]">
                            {formatTime(session.check_in)}
                          </td>
                          <td className="py-3 px-4 text-[#a1a1aa]">
                            {session.check_out ? formatTime(session.check_out) : <span className="text-emerald-400 font-semibold">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white text-[0.7rem] font-medium">
                              {session.workout_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#a1a1aa]">
                            {session.duration_minutes !== null && session.duration_minutes !== undefined
                              ? formatDuration(session.duration_minutes)
                              : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={isActive ? 'active' : 'closed'} label={isActive ? 'Active' : 'Completed'} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSession(session);
                              }}
                              iconLeft={<Eye className="w-3.5 h-3.5 text-blue-400" />}
                              aria-label="Inspect session"
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card / List Presentation (Visible on screens < 768px) */}
          <div className="md:hidden space-y-3">
            {filteredSessions.map((session) => {
              const isActive = !session.check_out;

              return (
                <Card
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="p-4 space-y-3 cursor-pointer hover:border-white/20 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {session.full_name || 'Student'}
                      </div>
                      <div className="text-xs font-mono text-[#a1a1aa]">
                        {session.roll_number || 'No roll number'}
                      </div>
                    </div>
                    <StatusBadge status={isActive ? 'active' : 'closed'} label={isActive ? 'Active' : 'Completed'} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[0.68rem] uppercase font-semibold text-[#71717a] block">Check In</span>
                      <span className="text-[#fafafa] font-medium">{formatTime(session.check_in)}</span>
                    </div>

                    <div>
                      <span className="text-[0.68rem] uppercase font-semibold text-[#71717a] block">Check Out</span>
                      <span className="text-[#fafafa] font-medium">
                        {session.check_out ? formatTime(session.check_out) : <span className="text-emerald-400 font-semibold">Active</span>}
                      </span>
                    </div>

                    <div>
                      <span className="text-[0.68rem] uppercase font-semibold text-[#71717a] block">Workout Focus</span>
                      <span className="text-blue-400 font-medium">{session.workout_type}</span>
                    </div>

                    <div>
                      <span className="text-[0.68rem] uppercase font-semibold text-[#71717a] block">Duration</span>
                      <span className="font-mono text-[#fafafa]">
                        {session.duration_minutes ? formatDuration(session.duration_minutes) : 'In progress'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[0.7rem] text-blue-400 pt-1 font-medium">
                    <span>Tap for session details</span>
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Details Inspection Modal */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
};
