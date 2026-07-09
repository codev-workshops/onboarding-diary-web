import { beforeAll, describe, expect, it, vi } from "vitest";
import { actAs, jsonRequest, seedUsers, type Fixture } from "./entry-helpers";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", async () => {
  const { sessionRef } = await import("./entry-helpers");
  return { auth: async () => sessionRef.current };
});

import {
  GET as templatesGET,
  POST as templatesPOST,
} from "@/app/api/checklists/templates/route";
import {
  GET as templateGET,
  PATCH as templatePATCH,
  DELETE as templateDELETE,
} from "@/app/api/checklists/templates/[id]/route";
import {
  GET as assignmentsGET,
  POST as assignmentsPOST,
} from "@/app/api/checklists/assignments/route";
import {
  GET as assignmentGET,
  DELETE as assignmentDELETE,
} from "@/app/api/checklists/assignments/[id]/route";
import {
  PUT as completionPUT,
  DELETE as completionDELETE,
} from "@/app/api/checklists/assignments/[id]/items/[itemId]/completion/route";
import { GET as dashboardGET } from "@/app/api/dashboard/route";

let f: Fixture;

beforeAll(async () => {
  f = await seedUsers("checklists");
});

function ctx(id: string) {
  return { params: { id } };
}

function itemCtx(id: string, itemId: string) {
  return { params: { id, itemId } };
}

async function createTemplate(
  user: Fixture[keyof Fixture],
  title = "Week one",
  items = ["Set up laptop", "Meet the team", "Read the handbook"],
) {
  actAs(user);
  const res = await templatesPOST(
    jsonRequest("/api/checklists/templates", "POST", { title, items }),
  );
  return { res, body: await res.json() };
}

async function assign(
  user: Fixture[keyof Fixture],
  templateId: string,
  recruitId: string,
) {
  actAs(user);
  const res = await assignmentsPOST(
    jsonRequest("/api/checklists/assignments", "POST", {
      templateId,
      recruitId,
    }),
  );
  return { res, body: await res.json() };
}

describe("checklist templates", () => {
  it("manager creates a template with ordered items", async () => {
    const { res, body } = await createTemplate(f.manager);
    expect(res.status).toBe(201);
    expect(body.title).toBe("Week one");
    expect(body.items.map((i: { order: number }) => i.order)).toEqual([
      1, 2, 3,
    ]);
    expect(body.items.map((i: { text: string }) => i.text)).toEqual([
      "Set up laptop",
      "Meet the team",
      "Read the handbook",
    ]);
    expect(body.assignmentCount).toBe(0);
  });

  it("admin creates and lists templates", async () => {
    const { res } = await createTemplate(f.admin, "Admin template", ["one"]);
    expect(res.status).toBe(201);
    actAs(f.admin);
    const listRes = await templatesGET();
    const list = await listRes.json();
    expect(listRes.status).toBe(200);
    expect(list.items.length).toBeGreaterThanOrEqual(2);
  });

  it("recruit cannot create or list templates (403)", async () => {
    const { res } = await createTemplate(f.recruit);
    expect(res.status).toBe(403);
    actAs(f.recruit);
    expect((await templatesGET()).status).toBe(403);
  });

  it("validates title and items", async () => {
    actAs(f.manager);
    const res = await templatesPOST(
      jsonRequest("/api/checklists/templates", "POST", {
        title: "",
        items: [],
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("updates a template's title and replaces its items", async () => {
    const { body: created } = await createTemplate(f.manager, "To update", [
      "a",
      "b",
    ]);
    actAs(f.manager);
    const res = await templatePATCH(
      jsonRequest(`/api/checklists/templates/${created.id}`, "PATCH", {
        title: "Updated",
        items: ["x", "y", "z"],
      }),
      ctx(created.id),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Updated");
    expect(body.items.map((i: { text: string }) => i.text)).toEqual([
      "x",
      "y",
      "z",
    ]);
  });

  it("deletes a template; missing id → 404", async () => {
    const { body: created } = await createTemplate(f.admin, "To delete", [
      "a",
    ]);
    actAs(f.admin);
    expect(
      (await templateDELETE(new Request("http://test"), ctx(created.id)))
        .status,
    ).toBe(204);
    expect(
      (await templateGET(new Request("http://test"), ctx(created.id))).status,
    ).toBe(404);
  });
});

describe("checklist lifecycle: template → assign → complete → progress", () => {
  it("runs the full lifecycle with correct progress percentages", async () => {
    const { body: template } = await createTemplate(f.manager, "Lifecycle", [
      "step 1",
      "step 2",
      "step 3",
      "step 4",
    ]);

    // Manager assigns to their recruit.
    const { res: assignRes, body: assignment } = await assign(
      f.manager,
      template.id,
      f.recruit.id,
    );
    expect(assignRes.status).toBe(201);
    expect(assignment.progressPct).toBe(0);
    expect(assignment.totalCount).toBe(4);

    // Recruit sees the assignment.
    actAs(f.recruit);
    const listRes = await assignmentsGET();
    const list = await listRes.json();
    expect(
      list.items.some((a: { id: string }) => a.id === assignment.id),
    ).toBe(true);

    // Recruit ticks two items → 50%.
    const [i1, i2] = assignment.items;
    let res = await completionPUT(
      new Request("http://test"),
      itemCtx(assignment.id, i1.id),
    );
    expect(res.status).toBe(200);
    res = await completionPUT(
      new Request("http://test"),
      itemCtx(assignment.id, i2.id),
    );
    let body = await res.json();
    expect(body.completedCount).toBe(2);
    expect(body.progressPct).toBe(50);
    expect(
      body.items.filter((i: { completed: boolean }) => i.completed),
    ).toHaveLength(2);

    // Completion is idempotent.
    res = await completionPUT(
      new Request("http://test"),
      itemCtx(assignment.id, i1.id),
    );
    body = await res.json();
    expect(body.completedCount).toBe(2);

    // Untick one → 25%.
    res = await completionDELETE(
      new Request("http://test"),
      itemCtx(assignment.id, i1.id),
    );
    body = await res.json();
    expect(body.completedCount).toBe(1);
    expect(body.progressPct).toBe(25);

    // Manager dashboard shows per-recruit checklist progress.
    actAs(f.manager);
    const dashRes = await dashboardGET();
    const dash = await dashRes.json();
    const row = dash.recruits.find(
      (r: { userId: string }) => r.userId === f.recruit.id,
    );
    expect(row.checklist).toEqual({ completed: 1, total: 4, pct: 25 });
  });

  it("rejects duplicate assignment of the same template (409)", async () => {
    const { body: template } = await createTemplate(f.manager, "Dup", ["a"]);
    await assign(f.manager, template.id, f.recruit.id);
    const { res } = await assign(f.manager, template.id, f.recruit.id);
    expect(res.status).toBe(409);
  });
});

describe("checklist scoping matrix", () => {
  let assignmentId: string;
  let itemId: string;

  beforeAll(async () => {
    const { body: template } = await createTemplate(f.admin, "Scoping", [
      "only item",
    ]);
    const { body: assignment } = await assign(
      f.admin,
      template.id,
      f.recruit.id,
    );
    assignmentId = assignment.id;
    itemId = assignment.items[0].id;
  });

  it("manager cannot assign to a recruit they do not oversee (403)", async () => {
    const { body: template } = await createTemplate(f.manager, "Scoped", [
      "a",
    ]);
    const { res } = await assign(f.manager, template.id, f.otherRecruit.id);
    expect(res.status).toBe(403);
  });

  it("recruit cannot create assignments (403)", async () => {
    const { body: template } = await createTemplate(f.admin, "R-assign", [
      "a",
    ]);
    const { res } = await assign(f.recruit, template.id, f.recruit.id);
    expect(res.status).toBe(403);
  });

  it("another recruit cannot see or complete someone else's assignment (404)", async () => {
    actAs(f.otherRecruit);
    expect(
      (await assignmentGET(new Request("http://test"), ctx(assignmentId)))
        .status,
    ).toBe(404);
    expect(
      (
        await completionPUT(
          new Request("http://test"),
          itemCtx(assignmentId, itemId),
        )
      ).status,
    ).toBe(404);
  });

  it("manager/admin can read but not complete items (403)", async () => {
    actAs(f.manager);
    expect(
      (await assignmentGET(new Request("http://test"), ctx(assignmentId)))
        .status,
    ).toBe(200);
    expect(
      (
        await completionPUT(
          new Request("http://test"),
          itemCtx(assignmentId, itemId),
        )
      ).status,
    ).toBe(403);
    actAs(f.admin);
    expect(
      (
        await completionPUT(
          new Request("http://test"),
          itemCtx(assignmentId, itemId),
        )
      ).status,
    ).toBe(403);
  });

  it("manager outside scope gets 404 on the assignment", async () => {
    actAs(f.otherManager);
    expect(
      (await assignmentGET(new Request("http://test"), ctx(assignmentId)))
        .status,
    ).toBe(404);
  });

  it("recruit cannot delete an assignment (403); manager in scope can (204)", async () => {
    actAs(f.recruit);
    expect(
      (await assignmentDELETE(new Request("http://test"), ctx(assignmentId)))
        .status,
    ).toBe(403);
    actAs(f.manager);
    expect(
      (await assignmentDELETE(new Request("http://test"), ctx(assignmentId)))
        .status,
    ).toBe(204);
  });

  it("completing an unknown item in own assignment → 404", async () => {
    const { body: template } = await createTemplate(f.admin, "Unknown item", [
      "a",
    ]);
    const { body: assignment } = await assign(
      f.admin,
      template.id,
      f.recruit.id,
    );
    actAs(f.recruit);
    expect(
      (
        await completionPUT(
          new Request("http://test"),
          itemCtx(assignment.id, "nonexistent"),
        )
      ).status,
    ).toBe(404);
  });

  it("unauthenticated requests are rejected (401)", async () => {
    actAs(null);
    expect((await templatesGET()).status).toBe(401);
    expect((await assignmentsGET()).status).toBe(401);
  });
});
