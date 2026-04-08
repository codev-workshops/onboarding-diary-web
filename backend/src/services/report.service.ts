import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface ReportData {
  dateRange: { from: string; to: string };
  tasks?: Array<Record<string, unknown>>;
  issues?: Array<Record<string, unknown>>;
  feedback?: Array<Record<string, unknown>>;
  notes?: Array<Record<string, unknown>>;
  summary: {
    totalTasks?: number;
    completedTasks?: number;
    totalIssues?: number;
    openIssues?: number;
    totalFeedback?: number;
    totalNotes?: number;
  };
}

export class ReportService {
  async generateReport(
    userId: string,
    dateFrom: string,
    dateTo: string,
    categories: string[]
  ): Promise<ReportData> {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const report: ReportData = {
      dateRange: { from: dateFrom, to: dateTo },
      summary: {},
    };

    if (categories.includes('tasks')) {
      const tasks = await prisma.taskLog.findMany({
        where: { userId, date: { gte: from, lte: to } },
        orderBy: { date: 'desc' },
      });
      report.tasks = tasks;
      report.summary.totalTasks = tasks.length;
      report.summary.completedTasks = tasks.filter((t) => t.status === 'completed').length;
    }

    if (categories.includes('issues')) {
      const issues = await prisma.issueLog.findMany({
        where: { userId, date: { gte: from, lte: to } },
        orderBy: { date: 'desc' },
      });
      report.issues = issues;
      report.summary.totalIssues = issues.length;
      report.summary.openIssues = issues.filter((i) => i.status === 'open').length;
    }

    if (categories.includes('feedback')) {
      const feedback = await prisma.feedbackNote.findMany({
        where: { userId, date: { gte: from, lte: to } },
        orderBy: { date: 'desc' },
      });
      report.feedback = feedback;
      report.summary.totalFeedback = feedback.length;
    }

    if (categories.includes('notes')) {
      const notes = await prisma.additionalNote.findMany({
        where: { userId, date: { gte: from, lte: to } },
        orderBy: { date: 'desc' },
        include: { tags: { include: { tag: true } } },
      });
      report.notes = notes.map((n) => ({
        ...n,
        tags: n.tags.map((nt) => nt.tag.name),
      }));
      report.summary.totalNotes = notes.length;
    }

    return report;
  }

  async generateManagerReport(
    managerId: string,
    recruitId: string,
    dateFrom: string,
    dateTo: string,
    categories: string[]
  ) {
    const recruit = await prisma.user.findFirst({
      where: { id: recruitId, managerId },
    });

    if (!recruit) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this recruit');
    }

    const report = await this.generateReport(recruitId, dateFrom, dateTo, categories);
    return {
      recruit: { id: recruit.id, name: recruit.name, department: recruit.department },
      ...report,
    };
  }

  async generateCombinedManagerReport(
    managerId: string,
    dateFrom: string,
    dateTo: string,
    categories: string[]
  ) {
    const recruits = await prisma.user.findMany({
      where: { managerId, role: 'recruit', isActive: true },
      select: { id: true, name: true, department: true },
    });

    const reports = await Promise.all(
      recruits.map(async (recruit) => {
        const report = await this.generateReport(recruit.id, dateFrom, dateTo, categories);
        return { recruit, ...report };
      })
    );

    return reports;
  }

  formatReportAsCsv(report: ReportData): string {
    const lines: string[] = [];

    if (report.tasks && report.tasks.length > 0) {
      lines.push('TASKS');
      lines.push('Date,Title,Description,Category,Status,Priority');
      for (const task of report.tasks) {
        lines.push(
          `"${task.date}","${task.title}","${String(task.description || '').replace(/"/g, '""')}","${task.category}","${task.status}","${task.priority}"`
        );
      }
      lines.push('');
    }

    if (report.issues && report.issues.length > 0) {
      lines.push('ISSUES');
      lines.push('Date,Title,Description,Severity,Status,Resolution Notes');
      for (const issue of report.issues) {
        lines.push(
          `"${issue.date}","${issue.title}","${String(issue.description || '').replace(/"/g, '""')}","${issue.severity}","${issue.status}","${String(issue.resolutionNotes || '').replace(/"/g, '""')}"`
        );
      }
      lines.push('');
    }

    if (report.feedback && report.feedback.length > 0) {
      lines.push('FEEDBACK');
      lines.push('Date,Subject,Type,Details');
      for (const fb of report.feedback) {
        lines.push(
          `"${fb.date}","${fb.subject}","${fb.type}","${String(fb.details || '').replace(/"/g, '""')}"`
        );
      }
      lines.push('');
    }

    if (report.notes && report.notes.length > 0) {
      lines.push('NOTES');
      lines.push('Date,Title,Content,Tags');
      for (const note of report.notes) {
        const tags = Array.isArray(note.tags) ? (note.tags as string[]).join('; ') : '';
        lines.push(
          `"${note.date}","${note.title}","${String(note.content || '').replace(/"/g, '""')}","${tags}"`
        );
      }
    }

    return lines.join('\n');
  }
}

export const reportService = new ReportService();
