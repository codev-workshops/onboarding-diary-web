import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call next when validation passes', async () => {
    mockReq.body = { email: 'test@example.com' };
    const middleware = validate([body('email').isEmail()]);

    await middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 400 when validation fails', async () => {
    mockReq.body = { email: 'not-an-email' };
    const middleware = validate([body('email').isEmail().withMessage('Invalid email')]);

    await middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ]),
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle multiple validation errors', async () => {
    mockReq.body = {};
    const middleware = validate([
      body('email').notEmpty().withMessage('Email required'),
      body('password').notEmpty().withMessage('Password required'),
    ]);

    await middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.details.length).toBeGreaterThanOrEqual(2);
  });
});
