import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  actAs,
  jsonRequest,
  seedUsers,
  type Fixture,
} from "./entry-helpers";

vi.mock("@/lib/auth", async () => {
  const { sessionRef } = await import("./entry-helpers");
  return { auth: async () => sessionRef.current };
});

import { GET as listGET, POST as createPOST } from "@/app/api/tasks/route";
import {
  GET as idGET,
  PATCH as idPATCH,
  DELETE as idDELETE,
} from "@/app/api/tasks/[id]/route";

let f: Fixture;

const valid = {
  date: "2026-07-01",
  title: "Set up laptop",
  category: "SETUP",
};

async function create(body: Record<string, unknown> = valid) {
  const res = await createPOST(jsonRequest("/api/tasks", "POST", body));
  return { res, data: await res.json() };
}

beforeAll(async () => {
  f = await seedUsers("tasks");
});

describe("tasks CRUD (owner)", () => {
  it("creates a task with defaults and returns 201", async () => {
    actAs(f.recruit);
    const { res, data } = await create();
    expect(res.status).toBe(201);
    expect(data.authorId).toBe(f.recruit.id);
    expect(data.date).toBe("2026-07-01");
    expect(data.status).toBe("TODO");
    expect(data.priority).toBe("MEDIUM");
  });

  it("rejects invalid input with field errors", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "07/01/2026",
      title: "",
      category: "NOPE",
    });
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.fields.date).toBeDefined();
    expect(data.error.fields.title).toBeDefined();
    expect(data.error.fields.category).toBeDefined();
  });

  it("gets, patches, and deletes an own task", async () => {
    actAs(f.recruit);
    const { data } = await create();
    const got = await idGET(jsonRequest(`/api/tasks/${data.id}`, "GET"), {
      params: { id: data.id },
    });
    expect(got.status).toBe(200);

    const patched = await idPATCH(
      jsonRequest(`/api/tasks/${data.id}`, "PATCH", { status: "DONE" }),
      { params: { id: data.id } },
    );
    expect(patched.status).toBe(200);
    expect((await patched.json()).status).toBe("DONE");

    const deleted = await idDELETE(
      jsonRequest(`/api/tasks/${data.id}`, "DELETE"),
      { params: { id: data.id } },
    );
    expect(deleted.status).toBe(204);

    const gone = await idGET(jsonRequest(`/api/tasks/${data.id}`, "GET"), {
      params: { id: data.id },
    });
    expect(gone.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    actAs(null);
    const res = await listGET(jsonRequest("/api/tasks", "GET"));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHENTICATED");
  });
});

describe("tasks list filters and pagination", () => {
  beforeAll(async () => {
    actAs(f.recruit);
    await prismaReset();
    await create({ date: "2026-07-01", title: "A", category: "SETUP", status: "DONE" });
    await create({ date: "2026-07-02", title: "B", category: "SETUP", status: "TODO" });
    await create({ date: "2026-07-10", title: "C", category: "TRAINING", status: "DONE" });
    actAs(f.otherRecruit);
    await create({ date: "2026-07-01", title: "Other", category: "SETUP" });
  });

  async function prismaReset() {
    const { prisma } = await import("@/lib/prisma");
    await prisma.taskEntry.deleteMany();
  }

  async function list(qs: string) {
    const res = await listGET(jsonRequest(`/api/tasks${qs}`, "GET"));
    return { res, data: await res.json() };
  }

  it("lists only the caller's tasks, newest first", async () => {
    actAs(f.recruit);
    const { data } = await list("");
    expect(data.total).toBe(3);
    expect(data.items.map((i: { title: string }) => i.title)).toEqual([
      "C",
      "B",
      "A",
    ]);
  });

  it("AND-combines category, status, and date-range filters", async () => {
    actAs(f.recruit);
    expect((await list("?category=SETUP")).data.total).toBe(2);
    expect((await list("?category=SETUP&status=DONE")).data.total).toBe(1);
    expect(
      (await list("?status=DONE&from=2026-07-01&to=2026-07-05")).data.items.map(
        (i: { title: string }) => i.title,
      ),
    ).toEqual(["A"]);
    expect((await list("?category=TRAINING&status=TODO")).data.total).toBe(0);
  });

  it("paginates and rejects pageSize over 100", async () => {
    actAs(f.recruit);
    const { data } = await list("?page=2&pageSize=2");
    expect(data.page).toBe(2);
    expect(data.pageSize).toBe(2);
    expect(data.total).toBe(3);
    expect(data.items).toHaveLength(1);

    const { res } = await list("?pageSize=101");
    expect(res.status).toBe(400);
  });

  it("rejects an invalid filter value", async () => {
    actAs(f.recruit);
    const { res, data } = await list("?status=NOT_A_STATUS");
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("tasks authorization matrix", () => {
  let taskId: string;

  beforeAll(async () => {
    actAs(f.recruit);
    const { data } = await create();
    taskId = data.id;
  });

  it("lets an assigned manager list via ?userId=", async () => {
    actAs(f.manager);
    const res = await listGET(
      jsonRequest(`/api/tasks?userId=${f.recruit.id}`, "GET"),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBeGreaterThan(0);
    expect(
      data.items.every(
        (i: { authorId: string }) => i.authorId === f.recruit.id,
      ),
    ).toBe(true);
  });

  it("404s an unassigned manager's ?userId= list", async () => {
    actAs(f.otherManager);
    const res = await listGET(
      jsonRequest(`/api/tasks?userId=${f.recruit.id}`, "GET"),
    );
    expect(res.status).toBe(404);
  });

  it("403s a recruit listing another user via ?userId=", async () => {
    actAs(f.otherRecruit);
    const res = await listGET(
      jsonRequest(`/api/tasks?userId=${f.recruit.id}`, "GET"),
    );
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
  });

  it("lets an admin list any user via ?userId=", async () => {
    actAs(f.admin);
    const res = await listGET(
      jsonRequest(`/api/tasks?userId=${f.recruit.id}`, "GET"),
    );
    expect(res.status).toBe(200);
  });

  it("allows scoped reads by id but 403s non-owner mutations", async () => {
    actAs(f.manager);
    const read = await idGET(jsonRequest(`/api/tasks/${taskId}`, "GET"), {
      params: { id: taskId },
    });
    expect(read.status).toBe(200);

    const patch = await idPATCH(
      jsonRequest(`/api/tasks/${taskId}`, "PATCH", { status: "DONE" }),
      { params: { id: taskId } },
    );
    expect(patch.status).toBe(403);

    actAs(f.admin);
    const del = await idDELETE(jsonRequest(`/api/tasks/${taskId}`, "DELETE"), {
      params: { id: taskId },
    });
    expect(del.status).toBe(403);
  });

  it("404s out-of-scope reads by id", async () => {
    actAs(f.otherRecruit);
    const res = await idGET(jsonRequest(`/api/tasks/${taskId}`, "GET"), {
      params: { id: taskId },
    });
    expect(res.status).toBe(404);

    actAs(f.otherManager);
    const res2 = await idGET(jsonRequest(`/api/tasks/${taskId}`, "GET"), {
      params: { id: taskId },
    });
    expect(res2.status).toBe(404);
  });
});
