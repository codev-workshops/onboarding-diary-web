import { DashboardService } from '../../services/dashboard.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    taskLog: { count: jest.fn(), findMany: jest.fn() },
    issueLog: { count: jest.fn(), findMany: jest.fn() },
    feedbackNote: { count: jest.fn(), findMany: jest.fn() },
    additionalNote: { count: jest.fn(), findMany: jest.fn() },
    user: { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return summary with counts', async () => {
      prisma.taskLog.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);
      prisma.issueLog.count
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5);
      prisma.feedbackNote.count
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);
      prisma.additionalNote.count.mockResolvedValueOnce(4);
      prisma.user.findUnique.mockResolvedValueOnce({ startDate: new Date('2024-01-01') });

      const result = await dashboardService.getSummary('user-1');

      expect(result.tasks.total).toBe(10);
      expect(result.tasks.completed).toBe(5);
      expect(result.issues.total).toBe(8);
      expect(result.feedback.total).toBe(6);
      expect(result.notes.total).toBe(4);
      expect(result.completionRate).toBeGreaterThan(0);
      expect(result.daysOnboarding).toBeGreaterThan(0);
    });

    it('should handle zero tasks with 0 completion rate', async () => {
      prisma.taskLog.count.mockResolvedValue(0);
      prisma.issueLog.count.mockResolvedValue(0);
      prisma.feedbackNote.count.mockResolvedValue(0);
      prisma.additionalNote.count.mockResolvedValue(0);
      prisma.user.findUnique.mockResolvedValueOnce({ startDate: null });

      const result = await dashboardService.getSummary('user-1');
      expect(result.completionRate).toBe(0);
      expect(result.daysOnboarding).toBe(0);
    });
  });

  describe('getRecentEntries', () => {
    it('should return recent entries sorted by createdAt', async () => {
      prisma.taskLog.findMany.mockResolvedValue([
        { id: 't1', title: 'Task 1', date: new Date(), createdAt: new Date('2024-06-01'), status: 'completed' },
      ]);
      prisma.issueLog.findMany.mockResolvedValue([
        { id: 'i1', title: 'Issue 1', date: new Date(), createdAt: new Date('2024-06-02'), severity: 'high', status: 'open' },
      ]);
      prisma.feedbackNote.findMany.mockResolvedValue([
        { id: 'f1', subject: 'Feedback 1', date: new Date(), createdAt: new Date('2024-06-03'), type: 'positive' },
      ]);
      prisma.additionalNote.findMany.mockResolvedValue([
        { id: 'n1', title: 'Note 1', date: new Date(), createdAt: new Date('2024-06-04') },
      ]);

      const result = await dashboardService.getRecentEntries('user-1', 5);
      expect(result).toHaveLength(4);
      expect(result[0].category).toBe('note');
    });
  });

  describe('getManagerDashboard', () => {
    it('should return recruits with stats', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'recruit-1', name: 'Recruit 1', email: 'r1@test.com', department: 'Eng', startDate: new Date('2024-01-01') },
      ]);
      prisma.taskLog.count.mockResolvedValue(5);
      prisma.issueLog.count.mockResolvedValue(2);

      const result = await dashboardService.getManagerDashboard('manager-1');
      expect(result).toHaveLength(1);
      expect(result[0].taskCount).toBe(5);
      expect(result[0].openIssues).toBe(2);
    });
  });

  describe('getRecruitDashboard', () => {
    it('should throw 403 if recruit not found under manager', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(dashboardService.getRecruitDashboard('recruit-1', 'manager-1')).rejects.toThrow(AppError);
    });
  });
});
