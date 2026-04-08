const mockGet = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { reportsApi } from '../../api/reports';

describe('reportsApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('generate should call get with params', async () => {
    mockGet.mockResolvedValue({ data: { report: {} } });
    await reportsApi.generate({ dateFrom: '2024-01-01', dateTo: '2024-12-31' });
    expect(mockGet).toHaveBeenCalledWith('/reports', { params: { dateFrom: '2024-01-01', dateTo: '2024-12-31' } });
  });

  it('preview should call get with params', async () => {
    mockGet.mockResolvedValue({ data: { reportData: {} } });
    await reportsApi.preview({ dateFrom: '2024-01-01', dateTo: '2024-12-31' });
    expect(mockGet).toHaveBeenCalledWith('/reports/preview', { params: { dateFrom: '2024-01-01', dateTo: '2024-12-31' } });
  });

  it('downloadCsv should call get with csv format', async () => {
    mockGet.mockResolvedValue({ data: 'csv-blob' });
    await reportsApi.downloadCsv({ dateFrom: '2024-01-01', dateTo: '2024-12-31' });
    expect(mockGet).toHaveBeenCalledWith('/reports', { params: { dateFrom: '2024-01-01', dateTo: '2024-12-31', format: 'csv' }, responseType: 'blob' });
  });

  it('generateManagerReport should call get with recruitId', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await reportsApi.generateManagerReport('recruit-1', { dateFrom: '2024-01-01', dateTo: '2024-12-31' });
    expect(mockGet).toHaveBeenCalledWith('/reports/manager/recruits/recruit-1', { params: { dateFrom: '2024-01-01', dateTo: '2024-12-31' } });
  });

  it('generateCombinedReport should call get', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await reportsApi.generateCombinedReport({ dateFrom: '2024-01-01', dateTo: '2024-12-31' });
    expect(mockGet).toHaveBeenCalledWith('/reports/manager', { params: { dateFrom: '2024-01-01', dateTo: '2024-12-31' } });
  });
});
