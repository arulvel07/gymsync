export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  roll_number: string;
  role: UserRole;
  created_at?: string;
}

export interface GymSession {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  workout_type: string;
  duration_minutes: number | null;
  full_name?: string;
  roll_number?: string;
}

export interface WorkoutDistributionItem {
  workout_type: string;
  count: number;
  percentage?: number;
}

export interface OccupancyResponse {
  current_count: number;
  max_capacity: number;
  percentage: number;
  is_open: boolean;
  workout_distribution: WorkoutDistributionItem[];
}

export interface GymConfig {
  id: number;
  max_capacity: number;
  open_time: string;
  close_time: string;
  open_time_2: string;
  close_time_2: string;
  is_open: boolean;
  updated_at?: string;
}

export interface UpdateConfigRequest {
  max_capacity?: number;
  open_time?: string;
  close_time?: string;
  open_time_2?: string;
  close_time_2?: string;
  is_open?: boolean;
}

export interface QRTokenResponse {
  token: string;
  created_at: string;
  expires_at: string;
  valid_seconds: number;
  qr_image: string;
}

export interface QRValidateResponse {
  valid: boolean;
  token: string;
  remaining_seconds: number;
  message: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  planned_date: string;
  planned_time_slot: number;
  workout_type: string;
  notes?: string | null;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  day_of_week: number;
  planned_time_slot: number;
  workout_type: string;
}

export interface ScheduleResponse {
  plans: WorkoutPlan[];
  templates: WorkoutTemplate[];
}

export interface CrowdForecastResponse {
  target_date: string;
  hour: number;
  predicted_count: number;
  max_capacity: number;
  predicted_percentage: number;
  planned_students_count: number;
  historical_avg_visitors: number;
  workout_breakdown: WorkoutDistributionItem[];
}

export interface AnalyticsSummary {
  total_visits_today: number;
  total_visits_week: number;
  total_visits_month: number;
  avg_duration_minutes: number;
  peak_hour: number;
  unique_users_today: number;
}

export interface PeakHour {
  hour: number;
  avg_visitors: number;
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  total_visits: number;
  unique_users: number;
  avg_duration_minutes: number;
  daily_breakdown: DailyStat[];
  workout_breakdown: WorkoutDistributionItem[];
}
