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

  private escapeCsvField(value: unknown): string {
    return String(value || '').replace(/"/g, '""');
  }

  private formatCsvSection(
    items: Array<Record<string, unknown>>,
    header: string,
    columns: string,
    rowFormatter: (item: Record<string, unknown>) => string
  ): string[] {
    const lines: string[] = [header, columns];
    for (const item of items) {
      lines.push(rowFormatter(item));
    }
    lines.push('');
    return lines;
  }

  formatReportAsCsv(report: ReportData): string {
    const lines: string[] = [];

    if (report.tasks && report.tasks.length > 0) {
      lines.push(...this.formatCsvSection(report.tasks, 'TASKS', 'Date,Title,Description,Category,Status,Priority',
        (t) => `"${t.date}","${t.title}","${this.escapeCsvField(t.description)}","${t.category}","${t.status}","${t.priority}"`
      ));
    }

    if (report.issues && report.issues.length > 0) {
      lines.push(...this.formatCsvSection(report.issues, 'ISSUES', 'Date,Title,Description,Severity,Status,Resolution Notes',
        (i) => `"${i.date}","${i.title}","${this.escapeCsvField(i.description)}","${i.severity}","${i.status}","${this.escapeCsvField(i.resolutionNotes)}"`
      ));
    }

    if (report.feedback && report.feedback.length > 0) {
      lines.push(...this.formatCsvSection(report.feedback, 'FEEDBACK', 'Date,Subject,Type,Details',
        (fb) => `"${fb.date}","${fb.subject}","${fb.type}","${this.escapeCsvField(fb.details)}"`
      ));
    }

    if (report.notes && report.notes.length > 0) {
      lines.push(...this.formatCsvSection(report.notes, 'NOTES', 'Date,Title,Content,Tags',
        (n) => {
          const tags = Array.isArray(n.tags) ? (n.tags as string[]).join('; ') : '';
          return `"${n.date}","${n.title}","${this.escapeCsvField(n.content)}","${tags}"`;
        }
      ));
    }

    return lines.join('\n');
  }
}

export const reportService = new ReportService();
