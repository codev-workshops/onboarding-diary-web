import { beforeAll, describe, expect, it, vi } from "vitest";
import { actAs, seedUsers, type Fixture } from "./entry-helpers";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", async () => {
  const { sessionRef } = await import("./entry-helpers");
  return { auth: async () => sessionRef.current };
});

import { GET as dashboardGET } from "@/app/api/dashboard/route";

let f: Fixture;

/** UTC midnight `daysAgo` days before today. */
function day(daysAgo: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

function key(daysAgo: number): string {
  return day(daysAgo).toISOString().slice(0, 10);
}

beforeAll(async () => {
  f = await seedUsers("charts");

  await prisma.taskEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: day(0), title: "t-today", category: "SETUP", status: "DONE", priority: "HIGH" },
      { authorId: f.recruit.id, date: day(3), title: "t-3d", category: "GENERAL", status: "TODO", priority: "LOW" },
      { authorId: f.recruit.id, date: day(3), title: "t-3d-2", category: "GENERAL", status: "IN_PROGRESS", priority: "LOW" },
      // Outside the 14-day window: counted in status donut, not the timeline.
      { authorId: f.recruit.id, date: day(20), title: "t-old", category: "MEETING", status: "BLOCKED", priority: "HIGH" },
      { authorId: f.otherRecruit.id, date: day(1), title: "t-other", category: "GENERAL", status: "TODO", priority: "LOW" },
    ],
  });
  await prisma.issueEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: day(2), title: "i-open", severity: "HIGH", status: "OPEN" },
      { authorId: f.recruit.id, date: day(2), title: "i-resolved", severity: "CRITICAL", status: "RESOLVED" },
      { authorId: f.otherRecruit.id, date: day(0), title: "i-other", severity: "CRITICAL", status: "OPEN" },
    ],
  });
  await prisma.feedbackEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: day(5), subject: "fb", type: "POSITIVE", details: "d" },
    ],
  });
  await prisma.noteEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: day(0), title: "n", content: "c", tags: "" },
    ],
  });
});

async function chartsAs(user: Fixture[keyof Fixture]) {
  actAs(user);
  const res = await dashboardGET();
  const data = await res.json();
  return { res, charts: data.charts };
}

describe("dashboard charts — recruit", () => {
  it("aggregates own task statuses into all four buckets", async () => {
    const { res, charts } = await chartsAs(f.recruit);
    expect(res.status).toBe(200);
    expect(charts.taskStatus).toEqual([
      { status: "TODO", count: 1 },
      { status: "IN_PROGRESS", count: 1 },
      { status: "DONE", count: 1 },
      { status: "BLOCKED", count: 1 },
    ]);
  });

  it("counts only own OPEN/IN_PROGRESS issues by severity", async () => {
    const { charts } = await chartsAs(f.recruit);
    expect(charts.issuesBySeverity).toEqual([
      { severity: "CRITICAL", count: 0 },
      { severity: "HIGH", count: 1 },
      { severity: "MEDIUM", count: 0 },
      { severity: "LOW", count: 0 },
    ]);
  });

  it("returns a 14-day timeline with per-type counts on the right days", async () => {
    const { charts } = await chartsAs(f.recruit);
    expect(charts.activityTimeline).toHaveLength(14);
    expect(charts.activityTimeline[0].date).toBe(key(13));
    expect(charts.activityTimeline[13].date).toBe(key(0));
    const byDate = new Map(
      charts.activityTimeline.map((d: { date: string }) => [d.date, d]),
    );
    expect(byDate.get(key(0))).toEqual({
      date: key(0),
      tasks: 1,
      issues: 0,
      feedback: 0,
      notes: 1,
    });
    expect(byDate.get(key(3))).toEqual({
      date: key(3),
      tasks: 2,
      issues: 0,
      feedback: 0,
      notes: 0,
    });
    expect(byDate.get(key(2))).toEqual({
      date: key(2),
      tasks: 0,
      issues: 2,
      feedback: 0,
      notes: 0,
    });
    expect(byDate.get(key(5))).toEqual({
      date: key(5),
      tasks: 0,
      issues: 0,
      feedback: 1,
      notes: 0,
    });
    // Entry 20 days ago must not appear anywhere in the window.
    const totalTasks = charts.activityTimeline.reduce(
      (a: number, d: { tasks: number }) => a + d.tasks,
      0,
    );
    expect(totalTasks).toBe(3);
  });
});

describe("dashboard charts — manager scoping", () => {
  it("aggregates only assigned recruits' entries", async () => {
    const { charts } = await chartsAs(f.manager);
    // manager oversees f.recruit only — same aggregates as the recruit view.
    expect(charts.taskStatus).toEqual([
      { status: "TODO", count: 1 },
      { status: "IN_PROGRESS", count: 1 },
      { status: "DONE", count: 1 },
      { status: "BLOCKED", count: 1 },
    ]);
    expect(charts.issuesBySeverity.find((s: { severity: string }) => s.severity === "CRITICAL")!.count).toBe(0);
  });

  it("returns empty chart data for a manager with no recruits", async () => {
    const { charts } = await chartsAs(f.otherManager);
    expect(charts.taskStatus.every((s: { count: number }) => s.count === 0)).toBe(true);
    expect(charts.activityTimeline).toHaveLength(14);
    expect(
      charts.activityTimeline.every(
        (d: { tasks: number; issues: number; feedback: number; notes: number }) =>
          d.tasks + d.issues + d.feedback + d.notes === 0,
      ),
    ).toBe(true);
  });
});

describe("dashboard charts — admin", () => {
  it("aggregates across all users", async () => {
    const { charts } = await chartsAs(f.admin);
    expect(charts.taskStatus).toEqual([
      { status: "TODO", count: 2 },
      { status: "IN_PROGRESS", count: 1 },
      { status: "DONE", count: 1 },
      { status: "BLOCKED", count: 1 },
    ]);
    expect(charts.issuesBySeverity).toEqual([
      { severity: "CRITICAL", count: 1 },
      { severity: "HIGH", count: 1 },
      { severity: "MEDIUM", count: 0 },
      { severity: "LOW", count: 0 },
    ]);
  });
});
