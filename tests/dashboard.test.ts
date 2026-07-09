import { beforeAll, describe, expect, it, vi } from "vitest";
import { actAs, seedUsers, type Fixture } from "./entry-helpers";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", async () => {
  const { sessionRef } = await import("./entry-helpers");
  return { auth: async () => sessionRef.current };
});

import { GET as dashboardGET } from "@/app/api/dashboard/route";

let f: Fixture;

function d(day: number): Date {
  return new Date(`2026-06-${String(day).padStart(2, "0")}T00:00:00.000Z`);
}

beforeAll(async () => {
  f = await seedUsers("dashboard");

  await prisma.taskEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: d(1), title: "t1", category: "SETUP", status: "DONE", priority: "HIGH" },
      { authorId: f.recruit.id, date: d(2), title: "t2", category: "GENERAL", status: "DONE", priority: "LOW" },
      { authorId: f.recruit.id, date: d(3), title: "t3", category: "TRAINING", status: "TODO", priority: "MEDIUM" },
      { authorId: f.recruit.id, date: d(4), title: "t4", category: "MEETING", status: "BLOCKED", priority: "HIGH" },
      { authorId: f.otherRecruit.id, date: d(5), title: "other-task", category: "GENERAL", status: "TODO", priority: "LOW" },
    ],
  });
  await prisma.issueEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: d(2), title: "i1", severity: "HIGH", status: "OPEN" },
      { authorId: f.recruit.id, date: d(3), title: "i2", severity: "HIGH", status: "IN_PROGRESS" },
      { authorId: f.recruit.id, date: d(4), title: "i3", severity: "LOW", status: "RESOLVED" },
      { authorId: f.otherRecruit.id, date: d(5), title: "other-issue", severity: "CRITICAL", status: "OPEN" },
    ],
  });
  await prisma.feedbackEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: d(6), subject: "f1", type: "POSITIVE", details: "d" },
    ],
  });
  await prisma.noteEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: d(7), title: "n1", content: "c", tags: "" },
      { authorId: f.recruit.id, date: d(8), title: "n2", content: "c", tags: "" },
    ],
  });
});

async function getDashboardAs(user: Fixture[keyof Fixture]) {
  actAs(user);
  const res = await dashboardGET();
  return { res, data: await res.json() };
}

describe("dashboard — recruit", () => {
  it("returns own counts, completion %, open issues, and recent entries", async () => {
    const { res, data } = await getDashboardAs(f.recruit);
    expect(res.status).toBe(200);
    expect(data.role).toBe("RECRUIT");
    expect(data.taskCounts).toEqual({
      TODO: 1,
      IN_PROGRESS: 0,
      DONE: 2,
      BLOCKED: 1,
    });
    expect(data.completionPct).toBe(50);
    expect(data.openIssues).toBe(2); // OPEN + IN_PROGRESS only
    expect(data.openIssuesBySeverity).toEqual({ HIGH: 2 });
    expect(data.feedbackCount).toBe(1);
    expect(data.noteCount).toBe(2);
    // 5 most recent across types, newest first, own data only.
    expect(data.recent).toHaveLength(5);
    expect(data.recent.map((r: { title: string }) => r.title)).toEqual([
      "n2",
      "n1",
      "f1",
      "i3",
      "t4",
    ]);
    expect(
      data.recent.every((r: { title: string }) => !r.title.startsWith("other")),
    ).toBe(true);
  });

  it("handles a recruit with no entries (0% completion)", async () => {
    const { data } = await getDashboardAs(f.otherRecruit);
    expect(data.completionPct).toBe(0);
    expect(data.taskCounts.TODO).toBe(1);
    expect(data.openIssues).toBe(1);
    expect(data.feedbackCount).toBe(0);
  });
});

describe("dashboard — manager", () => {
  it("returns per-recruit rows for assigned recruits only", async () => {
    const { res, data } = await getDashboardAs(f.manager);
    expect(res.status).toBe(200);
    expect(data.role).toBe("MANAGER");
    expect(data.recruits).toHaveLength(1);
    const row = data.recruits[0];
    expect(row.userId).toBe(f.recruit.id);
    expect(row.completionPct).toBe(50);
    expect(row.openIssues).toBe(2);
    expect(row.lastActivity).toBeTruthy();
  });

  it("returns an empty roster for a manager with no recruits", async () => {
    const { data } = await getDashboardAs(f.otherManager);
    expect(data.recruits).toEqual([]);
  });
});

describe("dashboard — admin", () => {
  it("returns org-wide user and entry totals", async () => {
    const { res, data } = await getDashboardAs(f.admin);
    expect(res.status).toBe(200);
    expect(data.role).toBe("ADMIN");
    expect(data.usersByRole).toEqual({ RECRUIT: 2, MANAGER: 2, ADMIN: 1 });
    expect(data.totals).toEqual({ tasks: 5, issues: 4, feedback: 1, notes: 2 });
    expect(data.openIssuesBySeverity).toEqual({ HIGH: 2, CRITICAL: 1 });
  });
});

describe("dashboard — auth", () => {
  it("rejects unauthenticated requests", async () => {
    actAs(null);
    const res = await dashboardGET();
    expect(res.status).toBe(401);
  });
});
