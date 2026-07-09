import { beforeAll, describe, expect, it, vi } from "vitest";
import { actAs, seedUsers, type Fixture } from "./entry-helpers";
import { prisma } from "@/lib/prisma";
import { csvEscape, reportFilename } from "@/lib/reports";

vi.mock("@/lib/auth", async () => {
  const { sessionRef } = await import("./entry-helpers");
  return { auth: async () => sessionRef.current };
});

import { GET as reportGET } from "@/app/api/reports/route";

let f: Fixture;

function req(params: Record<string, string>): Request {
  const search = new URLSearchParams(params);
  return new Request(`http://test/api/reports?${search}`);
}

const RANGE = { from: "2026-06-01", to: "2026-06-30" };

beforeAll(async () => {
  f = await seedUsers("reports");
  await prisma.taskEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: new Date("2026-06-05T00:00:00.000Z"), title: 'Task with "quotes", commas', category: "SETUP", status: "DONE", priority: "HIGH", description: "line1\nline2" },
      { authorId: f.recruit.id, date: new Date("2026-05-20T00:00:00.000Z"), title: "Out of range task", category: "GENERAL", status: "TODO", priority: "LOW" },
    ],
  });
  await prisma.issueEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: new Date("2026-06-10T00:00:00.000Z"), title: "In-range issue", severity: "HIGH", status: "OPEN" },
    ],
  });
  await prisma.feedbackEntry.createMany({
    data: [
      { authorId: f.recruit.id, date: new Date("2026-06-12T00:00:00.000Z"), subject: "Great onboarding", type: "POSITIVE", details: "details here" },
    ],
  });
});

describe("report validation", () => {
  it("rejects from > to", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ from: "2026-06-30", to: "2026-06-01", types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects ranges longer than 366 days", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ from: "2025-01-01", to: "2026-06-01", types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects unknown types and formats", async () => {
    actAs(f.recruit);
    const bad1 = await reportGET(
      req({ ...RANGE, types: "nope", format: "csv" }),
    );
    expect(bad1.status).toBe(400);
    const bad2 = await reportGET(
      req({ ...RANGE, types: "tasks", format: "xlsx" }),
    );
    expect(bad2.status).toBe(400);
  });

  it("requires authentication", async () => {
    actAs(null);
    const res = await reportGET(
      req({ ...RANGE, types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(401);
  });
});

describe("report scoping matrix", () => {
  it("recruit can generate own report", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ ...RANGE, types: "combined", format: "csv" }),
    );
    expect(res.status).toBe(200);
  });

  it("recruit targeting another user gets 403", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ ...RANGE, userId: f.otherRecruit.id, types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(403);
  });

  it("manager can generate for an assigned recruit", async () => {
    actAs(f.manager);
    const res = await reportGET(
      req({ ...RANGE, userId: f.recruit.id, types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(200);
  });

  it("manager targeting an unassigned recruit gets 403 (R3)", async () => {
    actAs(f.otherManager);
    const res = await reportGET(
      req({ ...RANGE, userId: f.recruit.id, types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(403);
  });

  it("admin can generate for any user", async () => {
    actAs(f.admin);
    const res = await reportGET(
      req({ ...RANGE, userId: f.recruit.id, types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(200);
  });

  it("admin targeting a nonexistent user gets 404", async () => {
    actAs(f.admin);
    const res = await reportGET(
      req({ ...RANGE, userId: "nonexistent", types: "tasks", format: "csv" }),
    );
    expect(res.status).toBe(404);
  });
});

describe("CSV report", () => {
  it("includes only in-range entries of the selected types with proper escaping", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ ...RANGE, types: "combined", format: "csv" }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const disposition = res.headers.get("Content-Disposition") ?? "";
    expect(disposition).toContain("attachment");
    expect(disposition).toContain(`_${RANGE.from}_${RANGE.to}.csv`);

    const body = await res.text();
    expect(body).toContain("TASKS");
    expect(body).toContain("ISSUES");
    expect(body).toContain("FEEDBACK");
    // Quotes doubled, field wrapped (commas + quotes present).
    expect(body).toContain('"Task with ""quotes"", commas"');
    // Newlines kept inside a quoted field.
    expect(body).toContain('"line1\nline2"');
    expect(body).toContain("In-range issue");
    expect(body).toContain("Great onboarding");
    expect(body).not.toContain("Out of range task");
  });

  it("limits sections to the requested types", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ ...RANGE, types: "issues", format: "csv" }),
    );
    const body = await res.text();
    expect(body).toContain("ISSUES");
    expect(body).not.toContain("TASKS");
    expect(body).not.toContain("FEEDBACK");
  });
});

describe("PDF report", () => {
  it("returns a non-empty PDF with correct content type and filename", async () => {
    actAs(f.recruit);
    const res = await reportGET(
      req({ ...RANGE, types: "combined", format: "pdf" }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain(".pdf");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(500);
    // %PDF magic bytes.
    expect(String.fromCharCode(...buf.slice(0, 5))).toBe("%PDF-");
  });
});

describe("report helpers", () => {
  it("csvEscape follows RFC 4180", () => {
    expect(csvEscape("plain")).toBe("plain");
    expect(csvEscape("a,b")).toBe('"a,b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape("multi\nline")).toBe('"multi\nline"');
  });

  it("csvEscape neutralizes spreadsheet formula triggers", () => {
    expect(csvEscape('=CMD("calc")')).toBe('"\'=CMD(""calc"")"');
    expect(csvEscape("+1")).toBe("'+1");
    expect(csvEscape("-1")).toBe("'-1");
    expect(csvEscape("@sum")).toBe("'@sum");
    expect(csvEscape("a=b")).toBe("a=b");
  });

  it("reportFilename slugs the user name and includes the range", () => {
    expect(reportFilename("Rita Recruit", "2026-06-01", "2026-06-30", "pdf")).toBe(
      "report_rita-recruit_2026-06-01_2026-06-30.pdf",
    );
    expect(reportFilename("***", "2026-06-01", "2026-06-30", "csv")).toBe(
      "report_user_2026-06-01_2026-06-30.csv",
    );
  });
});
