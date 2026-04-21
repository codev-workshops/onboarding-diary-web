import apiClient from './client';
import type { User } from '../types';

export const profileApi = {
  getProfile: () =>
    apiClient.get<{ user: User }>('/profile'),

  updateProfile: (data: { name?: string; department?: string; startDate?: string }) =>
    apiClient.patch<{ user: User }>('/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch('/profile/password', data),
};
