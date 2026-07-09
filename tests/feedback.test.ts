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

import { GET as listGET, POST as createPOST } from "@/app/api/feedback/route";
import {
  GET as idGET,
  PATCH as idPATCH,
  DELETE as idDELETE,
} from "@/app/api/feedback/[id]/route";

let f: Fixture;

async function create(body: Record<string, unknown>) {
  const res = await createPOST(jsonRequest("/api/feedback", "POST", body));
  return { res, data: await res.json() };
}

async function list(qs: string) {
  const res = await listGET(jsonRequest(`/api/feedback${qs}`, "GET"));
  return { res, data: await res.json() };
}

beforeAll(async () => {
  f = await seedUsers("feedback");
});

describe("feedback CRUD (owner)", () => {
  it("creates a feedback entry", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "2026-07-02",
      subject: "Great onboarding buddy",
      type: "POSITIVE",
      details: "Weekly pairing sessions were very helpful.",
    });
    expect(res.status).toBe(201);
    expect(data.type).toBe("POSITIVE");
    expect(data.subject).toBe("Great onboarding buddy");
  });

  it("requires details and a valid type", async () => {
    actAs(f.recruit);
    const { res, data } = await create({
      date: "2026-07-02",
      subject: "Missing bits",
      type: "RANT",
    });
    expect(res.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.fields.type).toBeDefined();
    expect(data.error.fields.details).toBeDefined();
  });

  it("patches and deletes an own entry", async () => {
    actAs(f.recruit);
    const { data } = await create({
      date: "2026-07-03",
      subject: "Docs gap",
      type: "SUGGESTION",
      details: "Add a setup FAQ.",
    });
    const patched = await idPATCH(
      jsonRequest(`/api/feedback/${data.id}`, "PATCH", { type: "CONCERN" }),
      { params: { id: data.id } },
    );
    expect(patched.status).toBe(200);
    expect((await patched.json()).type).toBe("CONCERN");

    const deleted = await idDELETE(
      jsonRequest(`/api/feedback/${data.id}`, "DELETE"),
      { params: { id: data.id } },
    );
    expect(deleted.status).toBe(204);
  });
});

describe("feedback list filters and scoped reads", () => {
  beforeAll(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.feedbackEntry.deleteMany();
    actAs(f.recruit);
    await create({ date: "2026-07-01", subject: "F1", type: "POSITIVE", details: "d" });
    await create({ date: "2026-07-05", subject: "F2", type: "CONCERN", details: "d" });
    await create({ date: "2026-07-09", subject: "F3", type: "POSITIVE", details: "d" });
  });

  it("AND-combines type and date range", async () => {
    actAs(f.recruit);
    expect((await list("?type=POSITIVE")).data.total).toBe(2);
    expect(
      (await list("?type=POSITIVE&from=2026-07-02")).data.items.map(
        (i: { subject: string }) => i.subject,
      ),
    ).toEqual(["F3"]);
  });

  it("admin reads any user via ?userId=; recruit foreign ?userId= is 403", async () => {
    actAs(f.admin);
    const scoped = await list(`?userId=${f.recruit.id}`);
    expect(scoped.res.status).toBe(200);
    expect(scoped.data.total).toBe(3);

    actAs(f.otherRecruit);
    const forbidden = await list(`?userId=${f.recruit.id}`);
    expect(forbidden.res.status).toBe(403);
  });

  it("out-of-scope read by id is 404; unknown id is 404", async () => {
    actAs(f.recruit);
    const { data } = await create({
      date: "2026-07-06",
      subject: "Private",
      type: "CONCERN",
      details: "d",
    });

    actAs(f.otherRecruit);
    const res = await idGET(jsonRequest(`/api/feedback/${data.id}`, "GET"), {
      params: { id: data.id },
    });
    expect(res.status).toBe(404);

    actAs(f.recruit);
    const missing = await idGET(jsonRequest("/api/feedback/nope", "GET"), {
      params: { id: "nope" },
    });
    expect(missing.status).toBe(404);
  });
});
