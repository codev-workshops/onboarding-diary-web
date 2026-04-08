import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class DashboardService {
  async getSummary(userId: string) {
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      totalIssues,
      openIssues,
      resolvedIssues,
      totalFeedback,
      positiveFeedback,
      suggestionFeedback,
      concernFeedback,
      totalNotes,
      user,
    ] = await Promise.all([
      prisma.taskLog.count({ where: { userId } }),
      prisma.taskLog.count({ where: { userId, status: 'completed' } }),
      prisma.taskLog.count({ where: { userId, status: 'in_progress' } }),
      prisma.taskLog.count({ where: { userId, status: 'not_started' } }),
      prisma.issueLog.count({ where: { userId } }),
      prisma.issueLog.count({ where: { userId, status: 'open' } }),
      prisma.issueLog.count({ where: { userId, status: 'resolved' } }),
      prisma.feedbackNote.count({ where: { userId } }),
      prisma.feedbackNote.count({ where: { userId, type: 'positive' } }),
      prisma.feedbackNote.count({ where: { userId, type: 'suggestion' } }),
      prisma.feedbackNote.count({ where: { userId, type: 'concern' } }),
      prisma.additionalNote.count({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { startDate: true } }),
    ]);

    const daysOnboarding = user?.startDate
      ? Math.floor((Date.now() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

    return {
      tasks: { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, notStarted: notStartedTasks },
      issues: { total: totalIssues, open: openIssues, resolved: resolvedIssues },
      feedback: { total: totalFeedback, positive: positiveFeedback, suggestion: suggestionFeedback, concern: concernFeedback },
      notes: { total: totalNotes },
      completionRate,
      daysOnboarding,
    };
  }

  async getRecentEntries(userId: string, limit = 5) {
    const [tasks, issues, feedback, notes] = await Promise.all([
      prisma.taskLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, date: true, createdAt: true, status: true },
      }),
      prisma.issueLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, date: true, createdAt: true, severity: true, status: true },
      }),
      prisma.feedbackNote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, subject: true, date: true, createdAt: true, type: true },
      }),
      prisma.additionalNote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, date: true, createdAt: true },
      }),
    ]);

    const entries = [
      ...tasks.map((t) => ({ ...t, category: 'task' as const })),
      ...issues.map((i) => ({ ...i, category: 'issue' as const })),
      ...feedback.map((f) => ({ ...f, title: f.subject, category: 'feedback' as const })),
      ...notes.map((n) => ({ ...n, category: 'note' as const })),
    ];

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return entries.slice(0, limit);
  }

  async getManagerDashboard(managerId: string) {
    const recruits = await prisma.user.findMany({
      where: { managerId, role: 'recruit', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        startDate: true,
      },
    });

    const recruitsWithStats = await Promise.all(
      recruits.map(async (recruit) => {
        const [taskCount, openIssues] = await Promise.all([
          prisma.taskLog.count({ where: { userId: recruit.id } }),
          prisma.issueLog.count({ where: { userId: recruit.id, status: 'open' } }),
        ]);

        const daysOnboarding = recruit.startDate
          ? Math.floor((Date.now() - new Date(recruit.startDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return { ...recruit, taskCount, openIssues, daysOnboarding };
      })
    );

    return recruitsWithStats;
  }

  async getRecruitDashboard(recruitId: string, managerId: string) {
    const recruit = await prisma.user.findFirst({
      where: { id: recruitId, managerId },
    });

    if (!recruit) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this recruit');
    }

    return this.getSummary(recruitId);
  }
}

export const dashboardService = new DashboardService();
