import apiClient from './client';
import type { PaginatedResponse, TaskLog, IssueLog, FeedbackNote, AdditionalNote } from '../types';

export const managerApi = {
  listRecruits: (params?: Record<string, string>) =>
    apiClient.get('/manager/recruits', { params }),

  getRecruitTasks: (recruitId: string, params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<TaskLog>>(`/manager/recruits/${recruitId}/tasks`, { params }),

  getRecruitIssues: (recruitId: string, params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<IssueLog>>(`/manager/recruits/${recruitId}/issues`, { params }),

  getRecruitFeedback: (recruitId: string, params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<FeedbackNote>>(`/manager/recruits/${recruitId}/feedback`, { params }),

  getRecruitNotes: (recruitId: string, params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<AdditionalNote>>(`/manager/recruits/${recruitId}/notes`, { params }),
};
