import { Response, NextFunction } from 'express';
import { ManagerController } from '../../controllers/manager.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/manager.service', () => ({
  managerService: {
    listRecruits: jest.fn(),
    getRecruitTasks: jest.fn(),
    getRecruitIssues: jest.fn(),
    getRecruitFeedback: jest.fn(),
    getRecruitNotes: jest.fn(),
  },
}));

import { managerService } from '../../services/manager.service';

describe('ManagerController', () => {
  let controller: ManagerController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ManagerController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'manager-1', email: 'mgr@example.com', role: 'manager' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('listRecruits should return 200', async () => {
    (managerService.listRecruits as jest.Mock).mockResolvedValue({ data: [], total: 0 });
    await controller.listRecruits(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('listRecruits should call next on error', async () => {
    (managerService.listRecruits as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.listRecruits(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getRecruitTasks should return 200', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitTasks as jest.Mock).mockResolvedValue({ data: [] });
    await controller.getRecruitTasks(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getRecruitTasks should call next on error', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitTasks as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getRecruitTasks(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getRecruitIssues should return 200', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitIssues as jest.Mock).mockResolvedValue({ data: [] });
    await controller.getRecruitIssues(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getRecruitIssues should call next on error', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitIssues as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getRecruitIssues(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getRecruitFeedback should return 200', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitFeedback as jest.Mock).mockResolvedValue({ data: [] });
    await controller.getRecruitFeedback(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getRecruitFeedback should call next on error', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitFeedback as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getRecruitFeedback(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getRecruitNotes should return 200', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitNotes as jest.Mock).mockResolvedValue({ data: [] });
    await controller.getRecruitNotes(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getRecruitNotes should call next on error', async () => {
    mockReq.params = { id: 'recruit-1' };
    (managerService.getRecruitNotes as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getRecruitNotes(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
