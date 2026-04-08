import apiClient from './client';
import { AdditionalNote, PaginatedResponse } from '../types';

export const notesApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<AdditionalNote>>('/notes', { params }),

  getById: (id: string) =>
    apiClient.get<{ note: AdditionalNote }>(`/notes/${id}`),

  create: (data: { date: string; title: string; content: string; tags?: string[] }) =>
    apiClient.post<{ note: AdditionalNote }>('/notes', data),

  update: (id: string, data: Partial<AdditionalNote>) =>
    apiClient.put<{ note: AdditionalNote }>(`/notes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/notes/${id}`),

  listTags: (search?: string) =>
    apiClient.get<{ tags: { id: string; name: string }[] }>('/tags', { params: { search } }),
};
