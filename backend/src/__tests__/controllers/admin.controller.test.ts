import { Response, NextFunction } from 'express';
import { AdminController } from '../../controllers/admin.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/admin.service', () => ({
  adminService: {
    listUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deactivateUser: jest.fn(),
    activateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

import { adminService } from '../../services/admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new AdminController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'admin-1', email: 'admin@example.com', role: 'admin' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('listUsers should return 200', async () => {
    (adminService.listUsers as jest.Mock).mockResolvedValue({ data: [], total: 0 });
    await controller.listUsers(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('listUsers should call next on error', async () => {
    (adminService.listUsers as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.listUsers(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('getUserById should return 200', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
    await controller.getUserById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getUserById should call next on error', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.getUserById as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getUserById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('createUser should return 201', async () => {
    (adminService.createUser as jest.Mock).mockResolvedValue({ id: 'u1' });
    await controller.createUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('createUser should call next on error', async () => {
    (adminService.createUser as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.createUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('updateUser should return 200', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.updateUser as jest.Mock).mockResolvedValue({ id: 'u1' });
    await controller.updateUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('updateUser should call next on error', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.updateUser as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.updateUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('deactivateUser should return 200', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.deactivateUser as jest.Mock).mockResolvedValue({ id: 'u1', isActive: false });
    await controller.deactivateUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deactivateUser should call next on error', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.deactivateUser as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.deactivateUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('activateUser should return 200', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.activateUser as jest.Mock).mockResolvedValue({ id: 'u1', isActive: true });
    await controller.activateUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('activateUser should call next on error', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.activateUser as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.activateUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('deleteUser should return 200', async () => {
    mockReq.params = { id: 'u1' };
    mockReq.body = { confirmEmail: 'test@example.com' };
    (adminService.deleteUser as jest.Mock).mockResolvedValue(undefined);
    await controller.deleteUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deleteUser should call next on error', async () => {
    mockReq.params = { id: 'u1' };
    (adminService.deleteUser as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.deleteUser(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
