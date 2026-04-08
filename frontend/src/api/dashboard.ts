import apiClient from './client';
import type { DashboardSummary, RecentEntry } from '../types';

export const dashboardApi = {
  getSummary: () =>
    apiClient.get<{ summary: DashboardSummary }>('/dashboard'),

  getRecentEntries: (limit = 5) =>
    apiClient.get<{ recentEntries: RecentEntry[] }>('/dashboard/recent', { params: { limit } }),

  getManagerDashboard: () =>
    apiClient.get('/dashboard/manager'),

  getRecruitDashboard: (recruitId: string) =>
    apiClient.get<{ summary: DashboardSummary }>(`/dashboard/manager/recruits/${recruitId}`),
};
