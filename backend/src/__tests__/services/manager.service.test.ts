import { ManagerService } from '../../services/manager.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: { findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    taskLog: { findMany: jest.fn(), count: jest.fn() },
    issueLog: { findMany: jest.fn(), count: jest.fn() },
    feedbackNote: { findMany: jest.fn(), count: jest.fn() },
    additionalNote: { findMany: jest.fn(), count: jest.fn() },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('ManagerService', () => {
  let managerService: ManagerService;

  beforeEach(() => {
    managerService = new ManagerService();
    jest.clearAllMocks();
  });

  describe('listRecruits', () => {
    it('should return paginated recruits', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'r1', name: 'Recruit 1' }]);
      prisma.user.count.mockResolvedValue(1);

      const result = await managerService.listRecruits('manager-1', {});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('verifyRecruitAccess', () => {
    it('should return recruit if accessible', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'r1', managerId: 'manager-1' });
      const result = await managerService.verifyRecruitAccess('r1', 'manager-1');
      expect(result.id).toBe('r1');
    });

    it('should throw 403 if recruit not accessible', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(managerService.verifyRecruitAccess('r1', 'manager-1')).rejects.toThrow(AppError);
    });
  });

  describe('getRecruitTasks', () => {
    it('should return recruit tasks after verifying access', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'r1', managerId: 'manager-1' });
      prisma.taskLog.findMany.mockResolvedValue([{ id: 't1', title: 'Task' }]);
      prisma.taskLog.count.mockResolvedValue(1);

      const result = await managerService.getRecruitTasks('r1', 'manager-1', {});
      expect(result.data).toHaveLength(1);
    });

    it('should throw if recruit not accessible', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(managerService.getRecruitTasks('r1', 'manager-1', {})).rejects.toThrow(AppError);
    });
  });

  describe('getRecruitIssues', () => {
    it('should return recruit issues', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'r1', managerId: 'manager-1' });
      prisma.issueLog.findMany.mockResolvedValue([{ id: 'i1' }]);
      prisma.issueLog.count.mockResolvedValue(1);

      const result = await managerService.getRecruitIssues('r1', 'manager-1', {});
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getRecruitFeedback', () => {
    it('should return recruit feedback', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'r1', managerId: 'manager-1' });
      prisma.feedbackNote.findMany.mockResolvedValue([{ id: 'f1' }]);
      prisma.feedbackNote.count.mockResolvedValue(1);

      const result = await managerService.getRecruitFeedback('r1', 'manager-1', {});
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getRecruitNotes', () => {
    it('should return recruit notes with tags', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'r1', managerId: 'manager-1' });
      prisma.additionalNote.findMany.mockResolvedValue([
        { id: 'n1', title: 'Note', tags: [{ tag: { name: 'javascript' } }] },
      ]);
      prisma.additionalNote.count.mockResolvedValue(1);

      const result = await managerService.getRecruitNotes('r1', 'manager-1', {});
      expect(result.data).toHaveLength(1);
    });
  });
});
