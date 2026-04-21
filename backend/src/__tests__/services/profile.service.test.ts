import { ProfileService } from '../../services/profile.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('ProfileService', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User', role: 'recruit' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await profileService.getProfile('user-1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-1' } }));
    });

    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(profileService.getProfile('user-999')).rejects.toThrow(AppError);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = { id: 'user-1', name: 'Updated Name', department: 'Engineering' };
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await profileService.updateProfile('user-1', { name: 'Updated Name', department: 'Engineering' });
      expect(result.name).toBe('Updated Name');
    });

    it('should update startDate when provided', async () => {
      prisma.user.update.mockResolvedValue({ id: 'user-1', startDate: new Date('2024-01-15') });
      await profileService.updateProfile('user-1', { startDate: '2024-01-15' });
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(profileService.changePassword('user-999', 'old', 'new')).rejects.toThrow(AppError);
    });

    it('should throw if current password is incorrect', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash: '$2a$12$invalidhashthatshouldnotmatch000000000000000',
      });

      await expect(profileService.changePassword('user-1', 'wrong-password', 'new-password')).rejects.toThrow(AppError);
    });
  });
});
