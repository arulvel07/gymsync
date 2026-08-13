import { apiRequest, publicApiRequest } from './client';
import type {
  ScheduleResponse,
  WorkoutPlan,
  WorkoutTemplate,
  CrowdForecastResponse,
} from '@/types';

export const plannerApi = {
  getMySchedule: () => apiRequest<ScheduleResponse>('/api/planner/my-schedule'),

  savePlan: (plannedDate: string, plannedTimeSlot: number, workoutType: string, notes?: string) =>
    apiRequest<WorkoutPlan>('/api/planner/plan', {
      method: 'POST',
      body: JSON.stringify({
        planned_date: plannedDate,
        planned_time_slot: plannedTimeSlot,
        workout_type: workoutType,
        notes,
      }),
    }),

  deletePlan: (plannedDate: string) =>
    apiRequest<{ message: string }>(`/api/planner/plan/${plannedDate}`, {
      method: 'DELETE',
    }),

  saveTemplate: (dayOfWeek: number, plannedTimeSlot: number, workoutType: string) =>
    apiRequest<WorkoutTemplate>('/api/planner/template', {
      method: 'POST',
      body: JSON.stringify({
        day_of_week: dayOfWeek,
        planned_time_slot: plannedTimeSlot,
        workout_type: workoutType,
      }),
    }),

  deleteTemplate: (dayOfWeek: number) =>
    apiRequest<{ message: string }>(`/api/planner/template/${dayOfWeek}`, {
      method: 'DELETE',
    }),

  getCrowdForecast: (targetDate: string, hour: number) =>
    publicApiRequest<CrowdForecastResponse>(
      `/api/planner/crowd-forecast?target_date=${targetDate}&hour=${hour}`
    ),
};
