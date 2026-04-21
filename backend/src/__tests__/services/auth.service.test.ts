import { AuthService } from '../../services/auth.service';
import { AppError } from '../../middleware/errorHandler';

// Mock the database module
jest.mock('../../config/database', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      passwordResetToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'recruit',
        department: null,
        startDate: null,
        createdAt: new Date(),
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.signup('test@example.com', 'Password123!', 'Test User');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw 409 if email already registered', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

      await expect(
        authService.signup('test@example.com', 'Password123!', 'Test User')
      ).rejects.toThrow(AppError);

      try {
        await authService.signup('test@example.com', 'Password123!', 'Test User');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(409);
        expect((err as AppError).code).toBe('CONFLICT');
      }
    });
  });

  describe('login', () => {
    it('should throw 401 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('test@example.com', 'Password123!')
      ).rejects.toThrow(AppError);
    });

    it('should throw 401 if user is inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        isActive: false,
        passwordHash: '$2a$12$hashedpassword',
      });

      await expect(
        authService.login('test@example.com', 'Password123!')
      ).rejects.toThrow(AppError);
    });

    it('should throw 401 if password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        isActive: true,
        passwordHash: '$2a$12$invalidhashthatshouldnotmatch000000000000000',
        role: 'recruit',
      });

      await expect(
        authService.login('test@example.com', 'WrongPassword123!')
      ).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should delete the refresh token', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await authService.logout('some-refresh-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should throw if refresh token not found', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshTokens('invalid-token')
      ).rejects.toThrow(AppError);
    });

    it('should throw if refresh token is expired', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 1000),
        user: { id: 'user-1', email: 'test@example.com', role: 'recruit' },
      });
      prisma.refreshToken.delete.mockResolvedValue({});

      await expect(
        authService.refreshTokens('expired-token')
      ).rejects.toThrow(AppError);
    });

    it('should throw if user is deactivated', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-1', email: 'test@example.com', role: 'recruit', isActive: false },
      });
      prisma.refreshToken.delete.mockResolvedValue({});

      try {
        await authService.refreshTokens('deactivated-user-token');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(401);
        expect((err as AppError).code).toBe('ACCOUNT_DISABLED');
      }
    });

    it('should return new tokens for valid refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-1', email: 'test@example.com', role: 'recruit', isActive: true },
      });
      prisma.refreshToken.delete.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await authService.refreshTokens('valid-token');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('forgotPassword', () => {
    it('should return undefined if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.forgotPassword('unknown@example.com');
      expect(result).toBeUndefined();
    });

    it('should create a reset token for existing user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });
      prisma.passwordResetToken.create.mockResolvedValue({});

      const result = await authService.forgotPassword('test@example.com');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('resetPassword', () => {
    it('should throw if reset token not found', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toThrow(AppError);
    });

    it('should throw if reset token is used', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'reset-1',
        tokenHash: 'hash',
        used: true,
        expiresAt: new Date(Date.now() + 3600000),
        userId: 'user-1',
      });

      await expect(
        authService.resetPassword('used-token', 'NewPassword123!')
      ).rejects.toThrow(AppError);
    });

    it('should throw if reset token is expired', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'reset-1',
        tokenHash: 'hash',
        used: false,
        expiresAt: new Date(Date.now() - 1000),
        userId: 'user-1',
      });

      await expect(
        authService.resetPassword('expired-token', 'NewPassword123!')
      ).rejects.toThrow(AppError);
    });

    it('should reset password for valid token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'reset-1',
        tokenHash: 'hash',
        used: false,
        expiresAt: new Date(Date.now() + 3600000),
        userId: 'user-1',
      });
      prisma.$transaction.mockResolvedValue([{}, {}]);

      await authService.resetPassword('valid-token', 'NewPassword123!');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
