import apiClient from './client';
import type { FeedbackNote, PaginatedResponse } from '../types';

export const feedbackApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<FeedbackNote>>('/feedback', { params }),

  getById: (id: string) =>
    apiClient.get<{ feedback: FeedbackNote }>(`/feedback/${id}`),

  create: (data: Partial<FeedbackNote>) =>
    apiClient.post<{ feedback: FeedbackNote }>('/feedback', data),

  update: (id: string, data: Partial<FeedbackNote>) =>
    apiClient.put<{ feedback: FeedbackNote }>(`/feedback/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/feedback/${id}`),
};
