import { ReportService } from '../../services/report.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    taskLog: { findMany: jest.fn() },
    issueLog: { findMany: jest.fn() },
    feedbackNote: { findMany: jest.fn() },
    additionalNote: { findMany: jest.fn() },
    user: { findFirst: jest.fn(), findMany: jest.fn() },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    it('should generate report with tasks', async () => {
      prisma.taskLog.findMany.mockResolvedValue([
        { id: 't1', title: 'Task 1', status: 'completed', date: '2024-01-15' },
        { id: 't2', title: 'Task 2', status: 'in_progress', date: '2024-01-16' },
      ]);

      const result = await reportService.generateReport('user-1', '2024-01-01', '2024-12-31', ['tasks']);
      expect(result.tasks).toHaveLength(2);
      expect(result.summary.totalTasks).toBe(2);
      expect(result.summary.completedTasks).toBe(1);
    });

    it('should generate report with issues', async () => {
      prisma.issueLog.findMany.mockResolvedValue([
        { id: 'i1', title: 'Issue 1', status: 'open' },
      ]);

      const result = await reportService.generateReport('user-1', '2024-01-01', '2024-12-31', ['issues']);
      expect(result.issues).toHaveLength(1);
      expect(result.summary.totalIssues).toBe(1);
      expect(result.summary.openIssues).toBe(1);
    });

    it('should generate report with feedback', async () => {
      prisma.feedbackNote.findMany.mockResolvedValue([{ id: 'f1', subject: 'Feedback' }]);

      const result = await reportService.generateReport('user-1', '2024-01-01', '2024-12-31', ['feedback']);
      expect(result.feedback).toHaveLength(1);
      expect(result.summary.totalFeedback).toBe(1);
    });

    it('should generate report with notes', async () => {
      prisma.additionalNote.findMany.mockResolvedValue([
        { id: 'n1', title: 'Note', tags: [{ tag: { name: 'javascript' } }] },
      ]);

      const result = await reportService.generateReport('user-1', '2024-01-01', '2024-12-31', ['notes']);
      expect(result.notes).toHaveLength(1);
      expect(result.summary.totalNotes).toBe(1);
    });

    it('should generate combined report', async () => {
      prisma.taskLog.findMany.mockResolvedValue([]);
      prisma.issueLog.findMany.mockResolvedValue([]);
      prisma.feedbackNote.findMany.mockResolvedValue([]);
      prisma.additionalNote.findMany.mockResolvedValue([]);

      const result = await reportService.generateReport('user-1', '2024-01-01', '2024-12-31', ['tasks', 'issues', 'feedback', 'notes']);
      expect(result.dateRange.from).toBe('2024-01-01');
      expect(result.dateRange.to).toBe('2024-12-31');
    });
  });

  describe('generateManagerReport', () => {
    it('should throw 403 if recruit not accessible', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(
        reportService.generateManagerReport('manager-1', 'recruit-1', '2024-01-01', '2024-12-31', ['tasks'])
      ).rejects.toThrow(AppError);
    });

    it('should generate report for accessible recruit', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'recruit-1', name: 'Recruit', department: 'Eng' });
      prisma.taskLog.findMany.mockResolvedValue([]);

      const result = await reportService.generateManagerReport('manager-1', 'recruit-1', '2024-01-01', '2024-12-31', ['tasks']);
      expect(result.recruit.id).toBe('recruit-1');
    });
  });

  describe('generateCombinedManagerReport', () => {
    it('should generate reports for all recruits', async () => {
      prisma.user.findMany.mockResolvedValue([
        { id: 'r1', name: 'Recruit 1', department: 'Eng' },
        { id: 'r2', name: 'Recruit 2', department: 'Eng' },
      ]);
      prisma.taskLog.findMany.mockResolvedValue([]);

      const result = await reportService.generateCombinedManagerReport('manager-1', '2024-01-01', '2024-12-31', ['tasks']);
      expect(result).toHaveLength(2);
    });
  });

  describe('formatReportAsCsv', () => {
    it('should format tasks as CSV', () => {
      const report = {
        dateRange: { from: '2024-01-01', to: '2024-12-31' },
        tasks: [{ date: '2024-01-15', title: 'Task 1', description: 'Desc', category: 'coding', status: 'completed', priority: 'high' }],
        summary: { totalTasks: 1, completedTasks: 1 },
      };

      const csv = reportService.formatReportAsCsv(report);
      expect(csv).toContain('TASKS');
      expect(csv).toContain('Task 1');
    });

    it('should format issues as CSV', () => {
      const report = {
        dateRange: { from: '2024-01-01', to: '2024-12-31' },
        issues: [{ date: '2024-01-15', title: 'Issue 1', description: '', severity: 'high', status: 'open', resolutionNotes: '' }],
        summary: { totalIssues: 1 },
      };

      const csv = reportService.formatReportAsCsv(report);
      expect(csv).toContain('ISSUES');
      expect(csv).toContain('Issue 1');
    });

    it('should format feedback as CSV', () => {
      const report = {
        dateRange: { from: '2024-01-01', to: '2024-12-31' },
        feedback: [{ date: '2024-01-15', subject: 'Feedback', type: 'positive', details: 'Great' }],
        summary: { totalFeedback: 1 },
      };

      const csv = reportService.formatReportAsCsv(report);
      expect(csv).toContain('FEEDBACK');
      expect(csv).toContain('Feedback');
    });

    it('should format notes as CSV', () => {
      const report = {
        dateRange: { from: '2024-01-01', to: '2024-12-31' },
        notes: [{ date: '2024-01-15', title: 'Note', content: 'Content', tags: ['javascript', 'react'] }],
        summary: { totalNotes: 1 },
      };

      const csv = reportService.formatReportAsCsv(report);
      expect(csv).toContain('NOTES');
      expect(csv).toContain('javascript; react');
    });

    it('should handle empty report', () => {
      const report = { dateRange: { from: '2024-01-01', to: '2024-12-31' }, summary: {} };
      const csv = reportService.formatReportAsCsv(report);
      expect(csv).toBe('');
    });
  });
});
