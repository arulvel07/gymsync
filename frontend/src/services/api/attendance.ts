import { apiRequest, publicApiRequest } from './client';
import type {
  OccupancyResponse,
  UserProfile,
  GymSession,
  QRValidateResponse,
} from '@/types';

export const attendanceApi = {
  /** Get current live gym occupancy (Public) */
  getOccupancy: () => publicApiRequest<OccupancyResponse>('/api/occupancy'),

  /** Validate a dynamic entrance QR token (Public) */
  validateQRToken: (token: string) =>
    publicApiRequest<QRValidateResponse>(`/api/qr-tokens/validate?token=${encodeURIComponent(token)}`),

  /** Get authenticated user profile */
  getProfile: () => apiRequest<UserProfile>('/api/profile'),

  /** Get user active gym session */
  getActiveSession: () =>
    apiRequest<{ active: boolean; session: GymSession | null }>('/api/active-session'),

  /** Check into the gym with workout type and optional QR token */
  checkIn: (workoutType: string, qrToken?: string) =>
    apiRequest<GymSession>('/api/check-in', {
      method: 'POST',
      body: JSON.stringify({ workout_type: workoutType, qr_token: qrToken }),
    }),

  /** Check out of active gym session */
  checkOut: () =>
    apiRequest<GymSession>('/api/check-out', {
      method: 'POST',
    }),

  /** Get user personal attendance history */
  getMySessions: (limit = 10, offset = 0) =>
    apiRequest<GymSession[]>(`/api/my-sessions?limit=${limit}&offset=${offset}`),
};
