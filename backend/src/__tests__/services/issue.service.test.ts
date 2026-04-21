import { IssueService } from '../../services/issue.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    issueLog: {
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

describe('IssueService', () => {
  let issueService: IssueService;

  beforeEach(() => {
    issueService = new IssueService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated issues', async () => {
      const mockIssues = [{ id: 'issue-1', title: 'Issue 1' }];
      prisma.issueLog.findMany.mockResolvedValue(mockIssues);
      prisma.issueLog.count.mockResolvedValue(1);

      const result = await issueService.list('user-1', {});
      expect(result.data).toEqual(mockIssues);
      expect(result.total).toBe(1);
    });

    it('should apply status and severity filters', async () => {
      prisma.issueLog.findMany.mockResolvedValue([]);
      prisma.issueLog.count.mockResolvedValue(0);

      await issueService.list('user-1', { status: 'open', severity: 'high' });
      const callArgs = prisma.issueLog.findMany.mock.calls[0][0];
      expect(callArgs.where.status).toBe('open');
      expect(callArgs.where.severity).toBe('high');
    });

    it('should apply date range filters', async () => {
      prisma.issueLog.findMany.mockResolvedValue([]);
      prisma.issueLog.count.mockResolvedValue(0);

      await issueService.list('user-1', { dateFrom: '2024-01-01', dateTo: '2024-12-31' });
      const callArgs = prisma.issueLog.findMany.mock.calls[0][0];
      expect(callArgs.where.date).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should return an issue if found', async () => {
      const mockIssue = { id: 'issue-1', title: 'Issue 1', userId: 'user-1' };
      prisma.issueLog.findFirst.mockResolvedValue(mockIssue);
      const result = await issueService.getById('issue-1', 'user-1');
      expect(result).toEqual(mockIssue);
    });

    it('should throw 404 if issue not found', async () => {
      prisma.issueLog.findFirst.mockResolvedValue(null);
      await expect(issueService.getById('issue-999', 'user-1')).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create an issue', async () => {
      const mockIssue = { id: 'issue-1', title: 'New Issue', status: 'open', severity: 'medium' };
      prisma.issueLog.create.mockResolvedValue(mockIssue);

      const result = await issueService.create('user-1', {
        date: '2024-01-15', title: 'New Issue', description: 'Description', severity: 'medium' as never,
      });
      expect(result).toEqual(mockIssue);
    });
  });

  describe('update', () => {
    it('should update an issue', async () => {
      prisma.issueLog.findFirst.mockResolvedValue({ id: 'issue-1', userId: 'user-1' });
      prisma.issueLog.update.mockResolvedValue({ id: 'issue-1', title: 'Updated' });

      const result = await issueService.update('issue-1', 'user-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw 404 if issue not found', async () => {
      prisma.issueLog.findFirst.mockResolvedValue(null);
      await expect(issueService.update('issue-999', 'user-1', {})).rejects.toThrow(AppError);
    });
  });

  describe('resolve', () => {
    it('should resolve an issue', async () => {
      prisma.issueLog.findFirst.mockResolvedValue({ id: 'issue-1', userId: 'user-1', status: 'open' });
      prisma.issueLog.update.mockResolvedValue({ id: 'issue-1', status: 'resolved' });

      const result = await issueService.resolve('issue-1', 'user-1', 'Fixed the bug');
      expect(result.status).toBe('resolved');
    });

    it('should throw 404 if issue not found', async () => {
      prisma.issueLog.findFirst.mockResolvedValue(null);
      await expect(issueService.resolve('issue-999', 'user-1', 'notes')).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete an issue', async () => {
      prisma.issueLog.findFirst.mockResolvedValue({ id: 'issue-1', userId: 'user-1' });
      prisma.issueLog.delete.mockResolvedValue({});

      await issueService.delete('issue-1', 'user-1');
      expect(prisma.issueLog.delete).toHaveBeenCalledWith({ where: { id: 'issue-1' } });
    });

    it('should throw 404 if issue not found', async () => {
      prisma.issueLog.findFirst.mockResolvedValue(null);
      await expect(issueService.delete('issue-999', 'user-1')).rejects.toThrow(AppError);
    });
  });
});
