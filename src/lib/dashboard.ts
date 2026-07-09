import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/guards";
import { TASK_STATUSES } from "@/lib/validation";

export type RecentEntry = {
  type: "task" | "issue" | "feedback" | "note";
  id: string;
  title: string;
  date: string;
};

export type RecruitDashboard = {
  taskCounts: Record<(typeof TASK_STATUSES)[number], number>;
  completionPct: number;
  openIssues: number;
  openIssuesBySeverity: Record<string, number>;
  feedbackCount: number;
  noteCount: number;
  recent: RecentEntry[];
};

export type ManagerDashboard = {
  recruits: {
    userId: string;
    name: string;
    completionPct: number;
    openIssues: number;
    lastActivity: string | null;
  }[];
};

export type AdminDashboard = {
  usersByRole: Record<string, number>;
  totals: { tasks: number; issues: number; feedback: number; notes: number };
  openIssuesBySeverity: Record<string, number>;
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

async function recruitDashboard(userId: string): Promise<RecruitDashboard> {
  const [taskGroups, openBySeverity, feedbackCount, noteCount] =
    await Promise.all([
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
  };
}

async function managerDashboard(managerId: string): Promise<ManagerDashboard> {
  const assignments = await prisma.managerAssignment.findMany({
    where: { managerId },
    include: { recruit: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  const recruitIds = assignments.map((a) => a.recruitId);
  if (recruitIds.length === 0) return { recruits: [] };

  const authorScope = { authorId: { in: recruitIds } };
  const [taskGroups, openIssueGroups, ...activityGroups] = await Promise.all([
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
    })),
  };
}

async function adminDashboard(): Promise<AdminDashboard> {
  const [roleGroups, tasks, issues, feedback, notes, openBySeverity] =
    await Promise.all([
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
