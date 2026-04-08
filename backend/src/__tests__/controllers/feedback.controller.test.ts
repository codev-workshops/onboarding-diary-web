import { Response, NextFunction } from 'express';
import { FeedbackController } from '../../controllers/feedback.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/feedback.service', () => ({
  feedbackService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { feedbackService } from '../../services/feedback.service';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new FeedbackController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('list should return 200', async () => {
    (feedbackService.list as jest.Mock).mockResolvedValue({ data: [], total: 0 });
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getById should return 200', async () => {
    mockReq.params = { id: 'fb-1' };
    (feedbackService.getById as jest.Mock).mockResolvedValue({ id: 'fb-1' });
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('create should return 201', async () => {
    (feedbackService.create as jest.Mock).mockResolvedValue({ id: 'fb-1' });
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('update should return 200', async () => {
    mockReq.params = { id: 'fb-1' };
    (feedbackService.update as jest.Mock).mockResolvedValue({ id: 'fb-1' });
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('delete should return 200', async () => {
    mockReq.params = { id: 'fb-1' };
    (feedbackService.delete as jest.Mock).mockResolvedValue(undefined);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should call next on errors', async () => {
    const error = new Error('fail');
    mockReq.params = { id: 'fb-1' };
    (feedbackService.list as jest.Mock).mockRejectedValue(error);
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);

    (feedbackService.getById as jest.Mock).mockRejectedValue(error);
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);

    (feedbackService.create as jest.Mock).mockRejectedValue(error);
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);

    (feedbackService.update as jest.Mock).mockRejectedValue(error);
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);

    (feedbackService.delete as jest.Mock).mockRejectedValue(error);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
  });
});
