import { Response, NextFunction } from 'express';
import { TaskController } from '../../controllers/task.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/task.service', () => ({
  taskService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { taskService } from '../../services/task.service';

describe('TaskController', () => {
  let controller: TaskController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new TaskController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('list should return 200', async () => {
    (taskService.list as jest.Mock).mockResolvedValue({ data: [], total: 0 });
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('list should call next on error', async () => {
    (taskService.list as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getById should return 200', async () => {
    mockReq.params = { id: 'task-1' };
    (taskService.getById as jest.Mock).mockResolvedValue({ id: 'task-1' });
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getById should call next on error', async () => {
    mockReq.params = { id: 'task-1' };
    (taskService.getById as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('create should return 201', async () => {
    (taskService.create as jest.Mock).mockResolvedValue({ id: 'task-1' });
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('create should call next on error', async () => {
    (taskService.create as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('update should return 200', async () => {
    mockReq.params = { id: 'task-1' };
    (taskService.update as jest.Mock).mockResolvedValue({ id: 'task-1' });
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('update should call next on error', async () => {
    mockReq.params = { id: 'task-1' };
    (taskService.update as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('delete should return 200', async () => {
    mockReq.params = { id: 'task-1' };
    (taskService.delete as jest.Mock).mockResolvedValue(undefined);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('delete should call next on error', async () => {
    mockReq.params = { id: 'task-1' };
    (taskService.delete as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
