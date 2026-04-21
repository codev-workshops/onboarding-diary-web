const mockGet = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { dashboardApi } from '../../api/dashboard';

describe('dashboardApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getSummary should call get', async () => {
    mockGet.mockResolvedValue({ data: { summary: {} } });
    await dashboardApi.getSummary();
    expect(mockGet).toHaveBeenCalledWith('/dashboard');
  });

  it('getRecentEntries should call get with limit', async () => {
    mockGet.mockResolvedValue({ data: { recentEntries: [] } });
    await dashboardApi.getRecentEntries(10);
    expect(mockGet).toHaveBeenCalledWith('/dashboard/recent', { params: { limit: 10 } });
  });

  it('getRecentEntries should use default limit', async () => {
    mockGet.mockResolvedValue({ data: { recentEntries: [] } });
    await dashboardApi.getRecentEntries();
    expect(mockGet).toHaveBeenCalledWith('/dashboard/recent', { params: { limit: 5 } });
  });

  it('getManagerDashboard should call get', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await dashboardApi.getManagerDashboard();
    expect(mockGet).toHaveBeenCalledWith('/dashboard/manager');
  });

  it('getRecruitDashboard should call get with id', async () => {
    mockGet.mockResolvedValue({ data: { summary: {} } });
    await dashboardApi.getRecruitDashboard('recruit-1');
    expect(mockGet).toHaveBeenCalledWith('/dashboard/manager/recruits/recruit-1');
  });
});
