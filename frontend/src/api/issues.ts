import apiClient from './client';
import { IssueLog, PaginatedResponse } from '../types';

export const issuesApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<IssueLog>>('/issues', { params }),

  getById: (id: string) =>
    apiClient.get<{ issue: IssueLog }>(`/issues/${id}`),

  create: (data: Partial<IssueLog>) =>
    apiClient.post<{ issue: IssueLog }>('/issues', data),

  update: (id: string, data: Partial<IssueLog>) =>
    apiClient.put<{ issue: IssueLog }>(`/issues/${id}`, data),

  resolve: (id: string, resolutionNotes: string) =>
    apiClient.patch<{ issue: IssueLog }>(`/issues/${id}/resolve`, { resolutionNotes }),

  delete: (id: string) =>
    apiClient.delete(`/issues/${id}`),
};
