import { Response, NextFunction } from 'express';
import { DashboardController } from '../../controllers/dashboard.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/dashboard.service', () => ({
  dashboardService: {
    getSummary: jest.fn(),
    getRecentEntries: jest.fn(),
    getManagerDashboard: jest.fn(),
    getRecruitDashboard: jest.fn(),
  },
}));

import { dashboardService } from '../../services/dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new DashboardController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('getSummary should return 200', async () => {
    (dashboardService.getSummary as jest.Mock).mockResolvedValue({ tasks: { total: 0 } });
    await controller.getSummary(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getSummary should call next on error', async () => {
    (dashboardService.getSummary as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getSummary(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getRecentEntries should return 200', async () => {
    mockReq.query = { limit: '10' };
    (dashboardService.getRecentEntries as jest.Mock).mockResolvedValue([]);
    await controller.getRecentEntries(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getRecentEntries should use default limit', async () => {
    mockReq.query = {};
    (dashboardService.getRecentEntries as jest.Mock).mockResolvedValue([]);
    await controller.getRecentEntries(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(dashboardService.getRecentEntries).toHaveBeenCalledWith('user-1', 5);
  });

  it('getRecentEntries should call next on error', async () => {
    (dashboardService.getRecentEntries as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getRecentEntries(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getManagerDashboard should return 200', async () => {
    (dashboardService.getManagerDashboard as jest.Mock).mockResolvedValue([]);
    await controller.getManagerDashboard(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getManagerDashboard should call next on error', async () => {
    (dashboardService.getManagerDashboard as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getManagerDashboard(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getRecruitDashboard should return 200', async () => {
    mockReq.params = { id: 'recruit-1' };
    (dashboardService.getRecruitDashboard as jest.Mock).mockResolvedValue({});
    await controller.getRecruitDashboard(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getRecruitDashboard should call next on error', async () => {
    mockReq.params = { id: 'recruit-1' };
    (dashboardService.getRecruitDashboard as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getRecruitDashboard(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
