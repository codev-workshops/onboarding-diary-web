import apiClient from './client';
import { User, PaginatedResponse } from '../types';

export const adminApi = {
  listUsers: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<User>>('/admin/users', { params }),

  getUserById: (id: string) =>
    apiClient.get<{ user: User }>(`/admin/users/${id}`),

  createUser: (data: Record<string, unknown>) =>
    apiClient.post<{ user: User }>('/admin/users', data),

  updateUser: (id: string, data: Record<string, unknown>) =>
    apiClient.put<{ user: User }>(`/admin/users/${id}`, data),

  deactivateUser: (id: string) =>
    apiClient.patch(`/admin/users/${id}/deactivate`),

  activateUser: (id: string) =>
    apiClient.patch(`/admin/users/${id}/activate`),

  deleteUser: (id: string, confirmEmail: string) =>
    apiClient.delete(`/admin/users/${id}`, { data: { confirmEmail } }),
};
