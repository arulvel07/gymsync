import { apiRequest } from './client';
import type {
  UserProfile,
  GymSession,
  GymConfig,
  UpdateConfigRequest,
  MonthlyReport,
  QRTokenResponse,
} from '@/types';

export const adminApi = {
  getUsers: (search = '') =>
    apiRequest<UserProfile[]>(`/api/admin/users?search=${encodeURIComponent(search)}`),

  getAllSessions: (limit = 50, offset = 0, search = '', dateFrom = '', dateTo = '') => {
    let url = `/api/admin/all-sessions?limit=${limit}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (dateFrom) url += `&date_from=${dateFrom}`;
    if (dateTo) url += `&date_to=${dateTo}`;
    return apiRequest<GymSession[]>(url);
  },

  getGymConfig: () => apiRequest<GymConfig>('/api/admin/config'),

  updateGymConfig: (updates: UpdateConfigRequest) =>
    apiRequest<GymConfig>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  getMonthlyReport: (year = 0, month = 0) =>
    apiRequest<MonthlyReport>(`/api/admin/reports/monthly?year=${year}&month=${month}`),

  getQRToken: () => apiRequest<QRTokenResponse>('/api/admin/qr-token'),

  rotateQRToken: () =>
    apiRequest<QRTokenResponse>('/api/admin/qr-token/rotate', {
      method: 'POST',
    }),
};
