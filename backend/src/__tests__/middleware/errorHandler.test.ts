import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../../middleware/errorHandler';

describe('Error Handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError', () => {
    it('should create an error with statusCode, code, and message', () => {
      const error = new AppError(400, 'BAD_REQUEST', 'Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Bad request');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create an error with details', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(404, 'NOT_FOUND', 'Resource not found');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'NOT_FOUND', message: 'Resource not found', details: undefined },
      });
    });

    it('should handle AppError with details', () => {
      const details = [{ field: 'name', message: 'Required' }];
      const error = new AppError(400, 'VALIDATION_ERROR', 'Validation failed', details);
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
      });
    });

    it('should handle generic errors with 500 status', () => {
      const error = new Error('Something went wrong');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
      consoleSpy.mockRestore();
    });
  });
});
