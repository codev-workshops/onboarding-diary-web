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

import { GET as listGET, POST as createPOST } from "@/app/api/notes/route";
import {
  GET as idGET,
  PATCH as idPATCH,
  DELETE as idDELETE,
} from "@/app/api/notes/[id]/route";

let f: Fixture;

async function create(body: Record<string, unknown>) {
  const res = await createPOST(jsonRequest("/api/notes", "POST", body));
  return { res, data: await res.json() };
}

async function list(qs: string) {
  const res = await listGET(jsonRequest(`/api/notes${qs}`, "GET"));
  return { res, data: await res.json() };
}

beforeAll(async () => {
  f = await seedUsers("notes");
});

describe("notes CRUD and tags round-trip", () => {
  it("accepts a tags array and returns it as an array", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "2026-07-02",
      title: "Standup notes",
      content: "Talked about sprint goals.",
      tags: ["meetings", "team"],
    });
    expect(res.status).toBe(201);
    expect(data.tags).toEqual(["meetings", "team"]);

    // Round-trip: stored comma-separated, exposed as array.
    const { prisma } = await import("@/lib/prisma");
    const stored = await prisma.noteEntry.findUnique({
      where: { id: data.id },
    });
    expect(stored!.tags).toBe("meetings,team");

    const got = await idGET(jsonRequest(`/api/notes/${data.id}`, "GET"), {
      params: { id: data.id },
    });
    expect((await got.json()).tags).toEqual(["meetings", "team"]);
  });

  it("defaults tags to an empty array", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "2026-07-02",
      title: "No tags",
      content: "c",
    });
    expect(res.status).toBe(201);
    expect(data.tags).toEqual([]);
  });

  it("rejects more than 10 tags and over-long tags", async () => {
    actAs(f.recruit);
    const tooMany = await create({
      date: "2026-07-02",
      title: "T",
      content: "c",
      tags: Array.from({ length: 11 }, (_, i) => `t${i}`),
    });
    expect(tooMany.res.status).toBe(400);
    expect(tooMany.data.error.fields.tags).toBeDefined();

    const tooLong = await create({
      date: "2026-07-02",
      title: "T",
      content: "c",
      tags: ["x".repeat(31)],
    });
    expect(tooLong.res.status).toBe(400);
  });

  it("patches tags and content, then deletes", async () => {
    actAs(f.recruit);
    const { data } = await create({
      date: "2026-07-03",
      title: "Patch me",
      content: "before",
      tags: ["old"],
    });
    const patched = await idPATCH(
      jsonRequest(`/api/notes/${data.id}`, "PATCH", {
        content: "after",
        tags: ["new", "fresh"],
      }),
      { params: { id: data.id } },
    );
    expect(patched.status).toBe(200);
    const body = await patched.json();
    expect(body.content).toBe("after");
    expect(body.tags).toEqual(["new", "fresh"]);

    const deleted = await idDELETE(
      jsonRequest(`/api/notes/${data.id}`, "DELETE"),
      { params: { id: data.id } },
    );
    expect(deleted.status).toBe(204);
  });
});

describe("notes list filters and scoping", () => {
  beforeAll(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.noteEntry.deleteMany();
    actAs(f.recruit);
    await create({ date: "2026-07-01", title: "N1", content: "c", tags: ["alpha"] });
    await create({ date: "2026-07-05", title: "N2", content: "c", tags: ["alpha", "beta"] });
    await create({ date: "2026-07-09", title: "N3", content: "c", tags: ["beta"] });
  });

  it("filters by tag AND date range", async () => {
    actAs(f.recruit);
    expect((await list("?tag=alpha")).data.total).toBe(2);
    expect(
      (await list("?tag=alpha&from=2026-07-02")).data.items.map(
        (i: { title: string }) => i.title,
      ),
    ).toEqual(["N2"]);
    // exact tag match, not substring
    expect((await list("?tag=alph")).data.total).toBe(0);
  });

  it("manager scoped list via ?userId= works only for assigned recruits", async () => {
    actAs(f.manager);
    const ok = await list(`?userId=${f.recruit.id}`);
    expect(ok.res.status).toBe(200);
    expect(ok.data.total).toBe(3);

    actAs(f.otherManager);
    const notFound = await list(`?userId=${f.recruit.id}`);
    expect(notFound.res.status).toBe(404);
  });

  it("non-owner mutation is 403 in scope, 404 out of scope", async () => {
    actAs(f.recruit);
    const { data } = await create({
      date: "2026-07-06",
      title: "Guarded",
      content: "c",
    });

    actAs(f.admin);
    const adminPatch = await idPATCH(
      jsonRequest(`/api/notes/${data.id}`, "PATCH", { title: "Nope" }),
      { params: { id: data.id } },
    );
    expect(adminPatch.status).toBe(403);

    actAs(f.otherRecruit);
    const outOfScope = await idDELETE(
      jsonRequest(`/api/notes/${data.id}`, "DELETE"),
      { params: { id: data.id } },
    );
    expect(outOfScope.status).toBe(404);
  });
});
