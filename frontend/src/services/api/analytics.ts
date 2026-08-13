import { apiRequest } from './client';
import type {
  PeakHour,
  DailyStat,
  WorkoutDistributionItem,
  AnalyticsSummary,
} from '@/types';

export const analyticsApi = {
  getPeakHours: (days = 30) =>
    apiRequest<PeakHour[]>(`/api/analytics/peak-hours?days=${days}`),

  getDailyStats: (days = 30) =>
    apiRequest<DailyStat[]>(`/api/analytics/daily-stats?days=${days}`),

  getWorkoutDistribution: (days = 30) =>
    apiRequest<WorkoutDistributionItem[]>(`/api/analytics/workout-distribution?days=${days}`),

  getSummary: () =>
    apiRequest<AnalyticsSummary>('/api/analytics/summary'),
};
