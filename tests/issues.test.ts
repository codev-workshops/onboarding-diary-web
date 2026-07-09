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

import { GET as listGET, POST as createPOST } from "@/app/api/issues/route";
import {
  GET as idGET,
  PATCH as idPATCH,
  DELETE as idDELETE,
} from "@/app/api/issues/[id]/route";

let f: Fixture;

async function create(body: Record<string, unknown>) {
  const res = await createPOST(jsonRequest("/api/issues", "POST", body));
  return { res, data: await res.json() };
}

async function list(qs: string) {
  const res = await listGET(jsonRequest(`/api/issues${qs}`, "GET"));
  return { res, data: await res.json() };
}

beforeAll(async () => {
  f = await seedUsers("issues");
});

describe("issues CRUD (owner)", () => {
  it("creates an issue with default OPEN status", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "2026-07-02",
      title: "VPN not working",
      severity: "HIGH",
    });
    expect(res.status).toBe(201);
    expect(data.status).toBe("OPEN");
    expect(data.severity).toBe("HIGH");
    expect(data.resolutionNotes).toBeNull();
  });

  it("rejects a missing severity and over-long title", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "2026-07-02",
      title: "x".repeat(201),
    });
    expect(res.status).toBe(400);
    expect(data.error.fields.title).toBeDefined();
    expect(data.error.fields.severity).toBeDefined();
  });

  it("patches resolution notes and status, then deletes", async () => {
    actAs(f.recruit);
    const { data } = await create({
      date: "2026-07-03",
      title: "Badge access",
      severity: "LOW",
    });
    const patched = await idPATCH(
      jsonRequest(`/api/issues/${data.id}`, "PATCH", {
        status: "RESOLVED",
        resolutionNotes: "Badge reissued by security.",
      }),
      { params: { id: data.id } },
    );
    expect(patched.status).toBe(200);
    const body = await patched.json();
    expect(body.status).toBe("RESOLVED");
    expect(body.resolutionNotes).toBe("Badge reissued by security.");

    const deleted = await idDELETE(
      jsonRequest(`/api/issues/${data.id}`, "DELETE"),
      { params: { id: data.id } },
    );
    expect(deleted.status).toBe(204);
  });
});

describe("issues list filters", () => {
  beforeAll(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.issueEntry.deleteMany();
    actAs(f.recruit);
    await create({ date: "2026-07-01", title: "I1", severity: "LOW", status: "OPEN" });
    await create({ date: "2026-07-05", title: "I2", severity: "CRITICAL", status: "OPEN" });
    await create({ date: "2026-07-09", title: "I3", severity: "CRITICAL", status: "RESOLVED" });
  });

  it("AND-combines status, severity, and date range", async () => {
    actAs(f.recruit);
    expect((await list("?severity=CRITICAL")).data.total).toBe(2);
    expect((await list("?severity=CRITICAL&status=OPEN")).data.total).toBe(1);
    expect(
      (await list("?status=OPEN&from=2026-07-02&to=2026-07-08")).data.items.map(
        (i: { title: string }) => i.title,
      ),
    ).toEqual(["I2"]);
  });
});

describe("issues authorization matrix", () => {
  let issueId: string;

  beforeAll(async () => {
    actAs(f.recruit);
    const { data } = await create({
      date: "2026-07-04",
      title: "Scoped issue",
      severity: "MEDIUM",
    });
    issueId = data.id;
  });

  it("assigned manager reads by id; unassigned manager gets 404", async () => {
    actAs(f.manager);
    const ok = await idGET(jsonRequest(`/api/issues/${issueId}`, "GET"), {
      params: { id: issueId },
    });
    expect(ok.status).toBe(200);

    actAs(f.otherManager);
    const notFound = await idGET(jsonRequest(`/api/issues/${issueId}`, "GET"), {
      params: { id: issueId },
    });
    expect(notFound.status).toBe(404);
  });

  it("manager mutation on assigned recruit's issue is 403", async () => {
    actAs(f.manager);
    const res = await idPATCH(
      jsonRequest(`/api/issues/${issueId}`, "PATCH", { status: "RESOLVED" }),
      { params: { id: issueId } },
    );
    expect(res.status).toBe(403);
  });

  it("recruit ?userId= for another user is 403; manager scoped list works", async () => {
    actAs(f.otherRecruit);
    const forbidden = await list(`?userId=${f.recruit.id}`);
    expect(forbidden.res.status).toBe(403);

    actAs(f.manager);
    const scoped = await list(`?userId=${f.recruit.id}`);
    expect(scoped.res.status).toBe(200);
    expect(scoped.data.total).toBeGreaterThan(0);
  });
});
