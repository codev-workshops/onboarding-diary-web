import apiClient from './client';
import { ReportData } from '../types';

export const reportsApi = {
  generate: (params: Record<string, string>) =>
    apiClient.get<{ report: ReportData }>('/reports', { params }),

  preview: (params: Record<string, string>) =>
    apiClient.get<{ reportData: ReportData }>('/reports/preview', { params }),

  downloadCsv: (params: Record<string, string>) =>
    apiClient.get('/reports', { params: { ...params, format: 'csv' }, responseType: 'blob' }),

  generateManagerReport: (recruitId: string, params: Record<string, string>) =>
    apiClient.get(`/reports/manager/recruits/${recruitId}`, { params }),

  generateCombinedReport: (params: Record<string, string>) =>
    apiClient.get('/reports/manager', { params }),
};
