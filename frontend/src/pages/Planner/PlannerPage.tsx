import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { plannerApi } from '@/services/api/planner';
import { useToast } from '@/components/ui/Toast';
import { ErrorState } from '@/components/ui/ErrorState';
import type { WorkoutPlan, WorkoutTemplate, CrowdForecastResponse } from '@/types';

// Subcomponents
import { PlannerHeader } from './components/PlannerHeader';
import { WeeklySchedule, WeekDayInfo } from './components/WeeklySchedule';
import { DaySelector } from './components/DaySelector';
import { WorkoutPlanForm } from './components/WorkoutPlanForm';
import { CrowdForecastCard } from './components/CrowdForecastCard';
import { ForecastComparison, TimeForecastItem } from './components/ForecastComparison';
import { WeeklyTemplateList } from './components/WeeklyTemplateList';

/**
 * Safely calculate Monday of a week given offset.
 */
function getMondayForOffset(offsetWeeks: number): Date {
  const now = new Date();
  const day = now.getDay();
  // Adjust so Monday is 1, Sunday is 7
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Format Date to YYYY-MM-DD local ISO date.
 */
function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Sensible comparison operating hours for GymSync
const COMPARISON_HOURS = [7, 16, 17, 18, 19];

export const PlannerPage: React.FC = () => {
  const { showToast } = useToast();

  // Week navigation state
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const todayStr = useMemo(() => toLocalISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(17); // 5 PM default

  // Schedule Data
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Forecast Data
  const [forecast, setForecast] = useState<CrowdForecastResponse | null>(null);
  const [comparisonItems, setComparisonItems] = useState<TimeForecastItem[]>([]);
  const [forecastLoading, setForecastLoading] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Compute 7 days of current viewed week (Mon..Sun)
  const weekDays = useMemo<WeekDayInfo[]>(() => {
    const monday = getMondayForOffset(weekOffset);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const days: WeekDayInfo[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = toLocalISODate(d);
      const jsDayIndex = d.getDay(); // 0=Sun, 1=Mon...

      days.push({
        dateStr,
        dayName: dayNames[jsDayIndex],
        shortName: shortNames[jsDayIndex],
        dayOfWeek: jsDayIndex,
        dayOfMonth: d.getDate(),
        monthName: monthNames[d.getMonth()],
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [weekOffset, todayStr]);

  const weekStartDate = useMemo(() => new Date(weekDays[0].dateStr), [weekDays]);
  const weekEndDate = useMemo(() => new Date(weekDays[6].dateStr), [weekDays]);

  // Load Schedule (Plans & Templates)
  const loadSchedule = useCallback(async (showLoader = false) => {
    if (showLoader) setScheduleLoading(true);
    setScheduleError(null);
    try {
      const res = await plannerApi.getMySchedule();
      setPlans(res.plans || []);
      setTemplates(res.templates || []);
    } catch (err: any) {
      console.error('[PlannerPage] Schedule load error:', err);
      setScheduleError(err.message || "Couldn't load schedule data");
    } finally {
      if (showLoader) setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule(true);
  }, [loadSchedule]);

  // Load Crowd Forecast & Comparison for selected date + hour
  const loadForecast = useCallback(async (date: string, hour: number) => {
    setForecastLoading(true);
    setForecastError(null);
    try {
      // Primary forecast query for selected date and hour
      const res = await plannerApi.getCrowdForecast(date, hour);
      setForecast(res);

      // Fetch comparison hours in parallel (reusing res for selected hour to avoid duplicate API call)
      const comparisonResults = await Promise.allSettled(
        COMPARISON_HOURS.map((h) => (h === hour ? Promise.resolve(res) : plannerApi.getCrowdForecast(date, h)))
      );

      const items: TimeForecastItem[] = [];
      comparisonResults.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          const val = result.value;
          items.push({
            hour: COMPARISON_HOURS[idx],
            count: val.predicted_count,
            percentage: val.predicted_percentage,
            maxCapacity: val.max_capacity,
          });
        }
      });

      setComparisonItems(items);
    } catch (err: any) {
      console.error('[PlannerPage] Forecast load error:', err);
      setForecastError(err.message || 'Forecast temporarily unavailable');
    } finally {
      setForecastLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTimeSlot) {
      loadForecast(selectedDate, selectedTimeSlot);
    }
  }, [selectedDate, selectedTimeSlot, loadForecast]);

  // Handle Save Plan
  const handleSavePlan = async (date: string, timeSlot: number, workout: string, notes?: string) => {
    try {
      await plannerApi.savePlan(date, timeSlot, workout, notes);
      showToast(`Saved workout plan for ${date}`, 'success');
      await loadSchedule(false);
      await loadForecast(date, timeSlot);
    } catch (err: any) {
      showToast(err.message || 'Failed to save plan', 'error');
      throw err;
    }
  };

  // Handle Delete Plan
  const handleDeletePlan = async (date: string) => {
    try {
      await plannerApi.deletePlan(date);
      showToast('Plan removed', 'info');
      await loadSchedule(false);
      await loadForecast(selectedDate, selectedTimeSlot);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove plan', 'error');
      throw err;
    }
  };

  // Handle Save Template
  const handleSaveTemplate = async (dayOfWeek: number, timeSlot: number, workout: string) => {
    try {
      await plannerApi.saveTemplate(dayOfWeek, timeSlot, workout);
      showToast('Weekly routine template updated', 'success');
      await loadSchedule(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save template', 'error');
      throw err;
    }
  };

  // Handle Delete Template
  const handleDeleteTemplate = async (dayOfWeek: number) => {
    try {
      await plannerApi.deleteTemplate(dayOfWeek);
      showToast('Template cleared', 'info');
      await loadSchedule(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to clear template', 'error');
      throw err;
    }
  };

  // Find existing plan for selected date if any
  const existingPlanForSelectedDate = useMemo(() => {
    return plans.find((p) => p.planned_date === selectedDate);
  }, [plans, selectedDate]);

  // Simple comparison forecasts payload for CrowdForecastCard
  const comparisonForecastsForCard = useMemo(() => {
    return comparisonItems.map((item) => ({
      hour: item.hour,
      count: item.count,
      percentage: item.percentage,
    }));
  }, [comparisonItems]);

  if (scheduleError && !plans.length) {
    return (
      <div className="py-12">
        <ErrorState
          title="We Couldn't Load Your Schedule"
          message="Your workout plans are safe. We just couldn't connect to the server."
          onRetry={() => loadSchedule(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Week Controls */}
      <PlannerHeader
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        isCurrentWeek={weekOffset === 0}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        onCurrentWeek={() => {
          setWeekOffset(0);
          setSelectedDate(todayStr);
        }}
      />

      {/* Primary Weekly Navigation View */}
      <WeeklySchedule
        weekDays={weekDays}
        plans={plans}
        templates={templates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        loading={scheduleLoading}
      />

      {/* Mobile Horizontal Day Selector */}
      <DaySelector
        weekDays={weekDays}
        plans={plans}
        templates={templates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Core Planning Grid: Workout Plan Form + Integrated Crowd Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 xl:col-span-6">
          <WorkoutPlanForm
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            existingPlan={existingPlanForSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
            loading={scheduleLoading}
          />
        </div>

        <div className="lg:col-span-6 xl:col-span-6">
          <CrowdForecastCard
            selectedDate={selectedDate}
            selectedHour={selectedTimeSlot}
            forecast={forecast}
            comparisonForecasts={comparisonForecastsForCard}
            loading={forecastLoading}
            error={forecastError}
            onRetry={() => loadForecast(selectedDate, selectedTimeSlot)}
          />
        </div>
      </div>

      {/* Time Slot Crowd Comparison Grid */}
      {comparisonItems.length > 0 && (
        <ForecastComparison
          items={comparisonItems}
          selectedHour={selectedTimeSlot}
          onSelectHour={setSelectedTimeSlot}
          loading={forecastLoading}
        />
      )}

      {/* Recurring Weekly Routines Section */}
      <WeeklyTemplateList
        templates={templates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        loading={scheduleLoading}
      />
    </div>
  );
};
