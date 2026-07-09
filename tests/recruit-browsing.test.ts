import { beforeAll, describe, expect, it, vi } from "vitest";
import { actAs, seedUsers, type Fixture } from "./entry-helpers";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", async () => {
  const { sessionRef } = await import("./entry-helpers");
  return { auth: async () => sessionRef.current };
});

import { GET as tasksGET } from "@/app/api/tasks/route";
import { GET as issuesGET } from "@/app/api/issues/route";
import { GET as feedbackGET } from "@/app/api/feedback/route";
import { GET as notesGET } from "@/app/api/notes/route";

let f: Fixture;

const LISTS = [
  { name: "tasks", handler: tasksGET },
  { name: "issues", handler: issuesGET },
  { name: "feedback", handler: feedbackGET },
  { name: "notes", handler: notesGET },
] as const;

function listReq(name: string, userId: string): Request {
  return new Request(`http://test/api/${name}?userId=${userId}`);
}

beforeAll(async () => {
  f = await seedUsers("recruit-browsing");
  const date = new Date("2026-06-15T00:00:00.000Z");
  await prisma.taskEntry.create({
    data: { authorId: f.recruit.id, date, title: "rb-task", category: "SETUP", status: "TODO", priority: "LOW" },
  });
  await prisma.issueEntry.create({
    data: { authorId: f.recruit.id, date, title: "rb-issue", severity: "LOW", status: "OPEN" },
  });
  await prisma.feedbackEntry.create({
    data: { authorId: f.recruit.id, date, subject: "rb-feedback", type: "POSITIVE", details: "d" },
  });
  await prisma.noteEntry.create({
    data: { authorId: f.recruit.id, date, title: "rb-note", content: "c", tags: "a,b" },
  });
});

/**
 * Scoping matrix for the recruit-browsing screen's data path
 * (docs/UI_FLOWS.md screen #12; `?userId=` scoped reads on all four
 * entry list endpoints).
 */
describe.each(LISTS)("recruit browsing — $name", ({ name, handler }) => {
  it("assigned manager reads the recruit's entries", async () => {
    actAs(f.manager);
    const res = await handler(listReq(name, f.recruit.id));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(1);
    expect(data.items[0].authorId).toBe(f.recruit.id);
  });

  it("unassigned manager gets 404 (no ID probing)", async () => {
    actAs(f.otherManager);
    const res = await handler(listReq(name, f.recruit.id));
    expect(res.status).toBe(404);
  });

  it("admin reads any recruit's entries", async () => {
    actAs(f.admin);
    const res = await handler(listReq(name, f.recruit.id));
    expect(res.status).toBe(200);
    expect((await res.json()).total).toBe(1);
  });

  it("recruit targeting another user gets 403", async () => {
    actAs(f.otherRecruit);
    const res = await handler(listReq(name, f.recruit.id));
    expect(res.status).toBe(403);
  });

  it("unauthenticated request gets 401", async () => {
    actAs(null);
    const res = await handler(listReq(name, f.recruit.id));
    expect(res.status).toBe(401);
  });
});
