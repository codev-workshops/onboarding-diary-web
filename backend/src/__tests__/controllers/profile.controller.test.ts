import { Response, NextFunction } from 'express';
import { ProfileController } from '../../controllers/profile.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/profile.service', () => ({
  profileService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
}));

import { profileService } from '../../services/profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ProfileController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('getProfile should return 200', async () => {
    (profileService.getProfile as jest.Mock).mockResolvedValue({ id: 'user-1', name: 'Test' });
    await controller.getProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getProfile should call next on error', async () => {
    (profileService.getProfile as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.getProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('updateProfile should return 200', async () => {
    mockReq.body = { name: 'Updated' };
    (profileService.updateProfile as jest.Mock).mockResolvedValue({ id: 'user-1', name: 'Updated' });
    await controller.updateProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('updateProfile should call next on error', async () => {
    (profileService.updateProfile as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.updateProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('changePassword should return 200', async () => {
    mockReq.body = { currentPassword: 'old', newPassword: 'new' };
    (profileService.changePassword as jest.Mock).mockResolvedValue(undefined);
    await controller.changePassword(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('changePassword should call next on error', async () => {
    (profileService.changePassword as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.changePassword(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
