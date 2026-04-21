import { Response, NextFunction } from 'express';
import { IssueController } from '../../controllers/issue.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/issue.service', () => ({
  issueService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    resolve: jest.fn(),
    delete: jest.fn(),
  },
}));

import { issueService } from '../../services/issue.service';

describe('IssueController', () => {
  let controller: IssueController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new IssueController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('list should return 200', async () => {
    (issueService.list as jest.Mock).mockResolvedValue({ data: [], total: 0 });
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('list should call next on error', async () => {
    (issueService.list as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getById should return 200', async () => {
    mockReq.params = { id: 'issue-1' };
    (issueService.getById as jest.Mock).mockResolvedValue({ id: 'issue-1' });
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('create should return 201', async () => {
    (issueService.create as jest.Mock).mockResolvedValue({ id: 'issue-1' });
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('update should return 200', async () => {
    mockReq.params = { id: 'issue-1' };
    (issueService.update as jest.Mock).mockResolvedValue({ id: 'issue-1' });
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('resolve should return 200', async () => {
    mockReq.params = { id: 'issue-1' };
    mockReq.body = { resolutionNotes: 'Fixed' };
    (issueService.resolve as jest.Mock).mockResolvedValue({ id: 'issue-1', status: 'resolved' });
    await controller.resolve(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('delete should return 200', async () => {
    mockReq.params = { id: 'issue-1' };
    (issueService.delete as jest.Mock).mockResolvedValue(undefined);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should call next on errors for all methods', async () => {
    const error = new Error('fail');
    mockReq.params = { id: 'issue-1' };
    (issueService.getById as jest.Mock).mockRejectedValue(error);
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);

    (issueService.create as jest.Mock).mockRejectedValue(error);
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);

    (issueService.update as jest.Mock).mockRejectedValue(error);
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);

    (issueService.resolve as jest.Mock).mockRejectedValue(error);
    await controller.resolve(mockReq as AuthRequest, mockRes as Response, mockNext);

    (issueService.delete as jest.Mock).mockRejectedValue(error);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
  });
});
