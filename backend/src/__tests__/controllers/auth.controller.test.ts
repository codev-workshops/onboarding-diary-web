import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../controllers/auth.controller';

jest.mock('../../services/auth.service', () => ({
  authService: {
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

import { authService } from '../../services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new AuthController();
    mockReq = { body: {}, query: {}, params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return 201 on successful signup', async () => {
      mockReq.body = { email: 'test@example.com', password: 'Password123!', name: 'Test' };
      (authService.signup as jest.Mock).mockResolvedValue({ user: { id: 'u1' }, accessToken: 'at', refreshToken: 'rt' });

      await controller.signup(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      mockReq.body = { email: 'test@example.com', password: 'Password123!', name: 'Test' };
      const error = new Error('Signup failed');
      (authService.signup as jest.Mock).mockRejectedValue(error);

      await controller.signup(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should return 200 on successful login', async () => {
      mockReq.body = { email: 'test@example.com', password: 'Password123!' };
      (authService.login as jest.Mock).mockResolvedValue({ user: { id: 'u1' }, accessToken: 'at', refreshToken: 'rt' });

      await controller.login(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('fail'));
      await controller.login(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should return 200 on successful logout', async () => {
      mockReq.body = { refreshToken: 'rt' };
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      await controller.logout(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should call next on error', async () => {
      (authService.logout as jest.Mock).mockRejectedValue(new Error('fail'));
      await controller.logout(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return 200 with new tokens', async () => {
      mockReq.body = { refreshToken: 'rt' };
      (authService.refreshTokens as jest.Mock).mockResolvedValue({ accessToken: 'new-at', refreshToken: 'new-rt' });

      await controller.refresh(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      (authService.refreshTokens as jest.Mock).mockRejectedValue(new Error('fail'));
      await controller.refresh(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should return 200', async () => {
      mockReq.body = { email: 'test@example.com' };
      (authService.forgotPassword as jest.Mock).mockResolvedValue('token');

      await controller.forgotPassword(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      (authService.forgotPassword as jest.Mock).mockRejectedValue(new Error('fail'));
      await controller.forgotPassword(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should return 200', async () => {
      mockReq.body = { token: 'reset-token', newPassword: 'NewPass123!' };
      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      await controller.resetPassword(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
    });

    it('should call next on error', async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue(new Error('fail'));
      await controller.resetPassword(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
