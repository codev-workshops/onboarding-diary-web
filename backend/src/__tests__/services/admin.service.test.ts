import { AdminService } from '../../services/admin.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    adminService = new AdminService();
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should return paginated users', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', name: 'User 1' }]);
      prisma.user.count.mockResolvedValue(1);

      const result = await adminService.listUsers({});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply search filter', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await adminService.listUsers({ search: 'test' });
      const callArgs = prisma.user.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('should apply role filter', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await adminService.listUsers({ role: 'recruit' });
      const callArgs = prisma.user.findMany.mock.calls[0][0];
      expect(callArgs.where.role).toBe('recruit');
    });

    it('should apply isActive filter', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await adminService.listUsers({ isActive: 'true' });
      const callArgs = prisma.user.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'User 1' });
      const result = await adminService.getUserById('u1');
      expect(result.id).toBe('u1');
    });

    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(adminService.getUserById('u999')).rejects.toThrow(AppError);
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'u1', email: 'new@example.com', name: 'New User', role: 'recruit' });

      const result = await adminService.createUser({
        email: 'new@example.com', password: 'Password123!', name: 'New User', role: 'recruit' as never,
      });
      expect(result.email).toBe('new@example.com');
    });

    it('should throw 409 if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(adminService.createUser({
        email: 'exists@example.com', password: 'Password123!', name: 'User', role: 'recruit' as never,
      })).rejects.toThrow(AppError);
    });

    it('should validate manager if managerId provided', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(adminService.createUser({
        email: 'new@example.com', password: 'Password123!', name: 'User', role: 'recruit' as never, managerId: 'invalid-manager',
      })).rejects.toThrow(AppError);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({ id: 'u1', name: 'Updated' });

      const result = await adminService.updateUser('u1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(adminService.updateUser('u999', { name: 'Test' })).rejects.toThrow(AppError);
    });

    it('should validate manager when managerId provided', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(adminService.updateUser('u1', { managerId: 'bad-manager' })).rejects.toThrow(AppError);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({ id: 'u1', isActive: false });

      const result = await adminService.deactivateUser('u1');
      expect(result.isActive).toBe(false);
    });

    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(adminService.deactivateUser('u999')).rejects.toThrow(AppError);
    });
  });

  describe('activateUser', () => {
    it('should activate a user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({ id: 'u1', isActive: true });

      const result = await adminService.activateUser('u1');
      expect(result.isActive).toBe(true);
    });

    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(adminService.activateUser('u999')).rejects.toThrow(AppError);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user when email matches', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });
      prisma.user.delete.mockResolvedValue({});

      await adminService.deleteUser('u1', 'test@example.com');
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });

    it('should throw 404 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(adminService.deleteUser('u999', 'test@example.com')).rejects.toThrow(AppError);
    });

    it('should throw if email does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });
      await expect(adminService.deleteUser('u1', 'wrong@example.com')).rejects.toThrow(AppError);
    });
  });
});
