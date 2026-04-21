import { Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { generateAccessToken } from '../../utils/jwt';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', () => {
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Basic token123' };
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' },
      });
    });

    it('should set req.user and call next for valid token', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', role: 'recruit' as const };
      const token = generateAccessToken(payload);
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe('user-1');
      expect(mockReq.user?.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('should return 401 if no user on request', () => {
      const middleware = authorize('admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user role not in allowed roles', () => {
      mockReq.user = { userId: 'user-1', email: 'test@example.com', role: 'recruit' };
      const middleware = authorize('admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    });

    it('should call next if user role is allowed', () => {
      mockReq.user = { userId: 'user-1', email: 'test@example.com', role: 'admin' };
      const middleware = authorize('admin', 'manager');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      mockReq.user = { userId: 'user-1', email: 'test@example.com', role: 'manager' };
      const middleware = authorize('admin', 'manager');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
