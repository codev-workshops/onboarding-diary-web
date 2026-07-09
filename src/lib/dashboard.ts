import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/guards";
import { TASK_STATUSES } from "@/lib/validation";
import { checklistProgressByRecruit } from "@/lib/checklists";

export type RecentEntry = {
  type: "task" | "issue" | "feedback" | "note";
  id: string;
  title: string;
  date: string;
};

export type ActivityDay = {
  date: string;
  tasks: number;
  issues: number;
  feedback: number;
  notes: number;
};

export type DashboardCharts = {
  taskStatus: { status: string; count: number }[];
  issuesBySeverity: { severity: string; count: number }[];
  activityTimeline: ActivityDay[];
};

export type RecruitDashboard = {
  taskCounts: Record<(typeof TASK_STATUSES)[number], number>;
  completionPct: number;
  openIssues: number;
  openIssuesBySeverity: Record<string, number>;
  feedbackCount: number;
  noteCount: number;
  recent: RecentEntry[];
  charts: DashboardCharts;
};

export type ManagerDashboard = {
  recruits: {
    userId: string;
    name: string;
    completionPct: number;
    openIssues: number;
    lastActivity: string | null;
    checklist: { completed: number; total: number; pct: number } | null;
  }[];
  charts: DashboardCharts;
};

export type AdminDashboard = {
  usersByRole: Record<string, number>;
  totals: { tasks: number; issues: number; feedback: number; notes: number };
  openIssuesBySeverity: Record<string, number>;
  charts: DashboardCharts;
};

export type Dashboard =
  | ({ role: "RECRUIT" } & RecruitDashboard)
  | ({ role: "MANAGER" } & ManagerDashboard)
  | ({ role: "ADMIN" } & AdminDashboard);

const OPEN_ISSUE_STATUSES = ["OPEN", "IN_PROGRESS"];

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function completionPct(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

const TIMELINE_DAYS = 14;

type AuthorWhere = { authorId?: string | { in: string[] } };

/**
 * Chart aggregations scoped by `authorWhere` (recruit: own entries;
 * manager: assigned recruits; admin: everything).
 */
async function chartData(authorWhere: AuthorWhere): Promise<DashboardCharts> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (TIMELINE_DAYS - 1));
  const dateScope = { ...authorWhere, date: { gte: since } };

  const [taskGroups, severityGroups, tasks, issues, feedback, notes] =
    await Promise.all([
      prisma.taskEntry.groupBy({
        by: ["status"],
        where: authorWhere,
        _count: { _all: true },
      }),
      prisma.issueEntry.groupBy({
        by: ["severity"],
        where: { ...authorWhere, status: { in: OPEN_ISSUE_STATUSES } },
        _count: { _all: true },
      }),
      prisma.taskEntry.findMany({ where: dateScope, select: { date: true } }),
      prisma.issueEntry.findMany({ where: dateScope, select: { date: true } }),
      prisma.feedbackEntry.findMany({
        where: dateScope,
        select: { date: true },
      }),
      prisma.noteEntry.findMany({ where: dateScope, select: { date: true } }),
    ]);

  const statusCounts = new Map(
    taskGroups.map((g) => [g.status, g._count._all]),
  );
  const taskStatus = TASK_STATUSES.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }));

  const severityCounts = new Map(
    severityGroups.map((g) => [g.severity, g._count._all]),
  );
  const issuesBySeverity = ISSUE_SEVERITY_ORDER.map((severity) => ({
    severity,
    count: severityCounts.get(severity) ?? 0,
  }));

  const byDay = new Map<string, ActivityDay>();
  for (let i = 0; i < TIMELINE_DAYS; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dateOnly(d);
    byDay.set(key, { date: key, tasks: 0, issues: 0, feedback: 0, notes: 0 });
  }
  const bump = (rows: { date: Date }[], field: keyof Omit<ActivityDay, "date">) => {
    for (const row of rows) {
      const day = byDay.get(dateOnly(row.date));
      if (day) day[field] += 1;
    }
  };
  bump(tasks, "tasks");
  bump(issues, "issues");
  bump(feedback, "feedback");
  bump(notes, "notes");

  const activityTimeline: ActivityDay[] = [];
  byDay.forEach((day) => activityTimeline.push(day));
  return { taskStatus, issuesBySeverity, activityTimeline };
}

const ISSUE_SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

async function recruitDashboard(userId: string): Promise<RecruitDashboard> {
  const [charts, taskGroups, openBySeverity, feedbackCount, noteCount] =
    await Promise.all([
      chartData({ authorId: userId }),
      prisma.taskEntry.groupBy({
        by: ["status"],
        where: { authorId: userId },
        _count: { _all: true },
      }),
      prisma.issueEntry.groupBy({
        by: ["severity"],
        where: { authorId: userId, status: { in: OPEN_ISSUE_STATUSES } },
        _count: { _all: true },
      }),
      prisma.feedbackEntry.count({ where: { authorId: userId } }),
      prisma.noteEntry.count({ where: { authorId: userId } }),
    ]);

  const taskCounts = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, 0]),
  ) as RecruitDashboard["taskCounts"];
  for (const g of taskGroups) {
    taskCounts[g.status as (typeof TASK_STATUSES)[number]] = g._count._all;
  }
  const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
  const openIssuesBySeverity = Object.fromEntries(
    openBySeverity.map((g) => [g.severity, g._count._all]),
  );
  const openIssues = openBySeverity.reduce((a, g) => a + g._count._all, 0);

  // 5 most recent entries across the four types (docs/REQUIREMENTS.md D1).
  const recentArgs = {
    where: { authorId: userId },
    orderBy: [{ date: "desc" as const }, { createdAt: "desc" as const }],
    take: 5,
  };
  const [tasks, issues, feedback, notes] = await Promise.all([
    prisma.taskEntry.findMany(recentArgs),
    prisma.issueEntry.findMany(recentArgs),
    prisma.feedbackEntry.findMany(recentArgs),
    prisma.noteEntry.findMany(recentArgs),
  ]);
  const recent: (RecentEntry & { createdAt: Date })[] = [
    ...tasks.map((r) => ({
      type: "task" as const,
      id: r.id,
      title: r.title,
      date: dateOnly(r.date),
      createdAt: r.createdAt,
    })),
    ...issues.map((r) => ({
      type: "issue" as const,
      id: r.id,
      title: r.title,
      date: dateOnly(r.date),
      createdAt: r.createdAt,
    })),
    ...feedback.map((r) => ({
      type: "feedback" as const,
      id: r.id,
      title: r.subject,
      date: dateOnly(r.date),
      createdAt: r.createdAt,
    })),
    ...notes.map((r) => ({
      type: "note" as const,
      id: r.id,
      title: r.title,
      date: dateOnly(r.date),
      createdAt: r.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    )
    .slice(0, 5);

  return {
    taskCounts,
    completionPct: completionPct(taskCounts.DONE, totalTasks),
    openIssues,
    openIssuesBySeverity,
    feedbackCount,
    noteCount,
    recent: recent.map(({ type, id, title, date }) => ({
      type,
      id,
      title,
      date,
    })),
    charts,
  };
}

async function managerDashboard(managerId: string): Promise<ManagerDashboard> {
  const assignments = await prisma.managerAssignment.findMany({
    where: { managerId },
    include: { recruit: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  const recruitIds = assignments.map((a) => a.recruitId);
  if (recruitIds.length === 0) {
    return { recruits: [], charts: await chartData({ authorId: { in: [] } }) };
  }

  const authorScope = { authorId: { in: recruitIds } };
  const [charts, checklistProgress, taskGroups, openIssueGroups, ...activityGroups] = await Promise.all([
    chartData(authorScope),
    checklistProgressByRecruit(recruitIds),
    prisma.taskEntry.groupBy({
      by: ["authorId", "status"],
      where: authorScope,
      _count: { _all: true },
    }),
    prisma.issueEntry.groupBy({
      by: ["authorId"],
      where: { ...authorScope, status: { in: OPEN_ISSUE_STATUSES } },
      _count: { _all: true },
    }),
    prisma.taskEntry.groupBy({
      by: ["authorId"],
      where: authorScope,
      _max: { updatedAt: true },
    }),
    prisma.issueEntry.groupBy({
      by: ["authorId"],
      where: authorScope,
      _max: { updatedAt: true },
    }),
    prisma.feedbackEntry.groupBy({
      by: ["authorId"],
      where: authorScope,
      _max: { updatedAt: true },
    }),
    prisma.noteEntry.groupBy({
      by: ["authorId"],
      where: authorScope,
      _max: { updatedAt: true },
    }),
  ]);

  const doneByAuthor = new Map<string, number>();
  const totalByAuthor = new Map<string, number>();
  for (const g of taskGroups) {
    totalByAuthor.set(
      g.authorId,
      (totalByAuthor.get(g.authorId) ?? 0) + g._count._all,
    );
    if (g.status === "DONE") doneByAuthor.set(g.authorId, g._count._all);
  }
  const openByAuthor = new Map(
    openIssueGroups.map((g) => [g.authorId, g._count._all]),
  );
  const lastActivityByAuthor = new Map<string, Date>();
  for (const groups of activityGroups) {
    for (const g of groups) {
      const max = g._max.updatedAt;
      if (!max) continue;
      const current = lastActivityByAuthor.get(g.authorId);
      if (!current || max > current) lastActivityByAuthor.set(g.authorId, max);
    }
  }

  return {
    recruits: assignments.map((a) => ({
      userId: a.recruitId,
      name: a.recruit.name,
      completionPct: completionPct(
        doneByAuthor.get(a.recruitId) ?? 0,
        totalByAuthor.get(a.recruitId) ?? 0,
      ),
      openIssues: openByAuthor.get(a.recruitId) ?? 0,
      lastActivity: lastActivityByAuthor.has(a.recruitId)
        ? dateOnly(lastActivityByAuthor.get(a.recruitId)!)
        : null,
      checklist: checklistProgress.get(a.recruitId) ?? null,
    })),
    charts,
  };
}

async function adminDashboard(): Promise<AdminDashboard> {
  const [charts, roleGroups, tasks, issues, feedback, notes, openBySeverity] =
    await Promise.all([
      chartData({}),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.taskEntry.count(),
      prisma.issueEntry.count(),
      prisma.feedbackEntry.count(),
      prisma.noteEntry.count(),
      prisma.issueEntry.groupBy({
        by: ["severity"],
        where: { status: { in: OPEN_ISSUE_STATUSES } },
        _count: { _all: true },
      }),
    ]);
  return {
    usersByRole: Object.fromEntries(
      roleGroups.map((g) => [g.role, g._count._all]),
    ),
    totals: { tasks, issues, feedback, notes },
    openIssuesBySeverity: Object.fromEntries(
      openBySeverity.map((g) => [g.severity, g._count._all]),
    ),
    charts,
  };
}

/** Role-appropriate dashboard summary, aggregated server-side. */
export async function getDashboard(user: SessionUser): Promise<Dashboard> {
  if (user.role === "MANAGER") {
    return { role: "MANAGER", ...(await managerDashboard(user.id)) };
  }
  if (user.role === "ADMIN") {
    return { role: "ADMIN", ...(await adminDashboard()) };
  }
  return { role: "RECRUIT", ...(await recruitDashboard(user.id)) };
}
