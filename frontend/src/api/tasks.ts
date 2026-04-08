import apiClient from './client';
import { TaskLog, PaginatedResponse } from '../types';

export const tasksApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<TaskLog>>('/tasks', { params }),

  getById: (id: string) =>
    apiClient.get<{ task: TaskLog }>(`/tasks/${id}`),

  create: (data: Partial<TaskLog>) =>
    apiClient.post<{ task: TaskLog }>('/tasks', data),

  update: (id: string, data: Partial<TaskLog>) =>
    apiClient.put<{ task: TaskLog }>(`/tasks/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),
};
