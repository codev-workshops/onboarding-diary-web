import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { requireOwnerOrScope, managerOversees } from "@/lib/guards";
import { HttpError } from "@/lib/errors";
import type { SessionUser } from "@/lib/guards";

let recruit: SessionUser;
let otherRecruit: SessionUser;
let manager: SessionUser;
let otherManager: SessionUser;
let admin: SessionUser;

async function expectHttpError(
  fn: () => Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await fn();
    expect.fail("expected HttpError");
  } catch (err) {
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).code).toBe(code);
  }
}

beforeAll(async () => {
  await prisma.managerAssignment.deleteMany();
  await prisma.user.deleteMany();
  const mk = (email: string, role: string) =>
    prisma.user.create({
      data: { email, name: email, role, passwordHash: "x" },
    });
  const r1 = await mk("g-recruit@example.com", "RECRUIT");
  const r2 = await mk("g-recruit2@example.com", "RECRUIT");
  const m1 = await mk("g-manager@example.com", "MANAGER");
  const m2 = await mk("g-manager2@example.com", "MANAGER");
  const a1 = await mk("g-admin@example.com", "ADMIN");
  await prisma.managerAssignment.create({
    data: { managerId: m1.id, recruitId: r1.id },
  });
  recruit = { id: r1.id, role: "RECRUIT" };
  otherRecruit = { id: r2.id, role: "RECRUIT" };
  manager = { id: m1.id, role: "MANAGER" };
  otherManager = { id: m2.id, role: "MANAGER" };
  admin = { id: a1.id, role: "ADMIN" };
});

describe("requireOwnerOrScope", () => {
  it("allows the owner to read and write", async () => {
    await requireOwnerOrScope(recruit, recruit.id, "read");
    await requireOwnerOrScope(recruit, recruit.id, "write");
  });

  it("allows an assigned manager to read a recruit's data", async () => {
    await requireOwnerOrScope(manager, recruit.id, "read");
  });

  it("rejects a manager mutation on an assigned recruit with 403", async () => {
    await expectHttpError(
      () => requireOwnerOrScope(manager, recruit.id, "write"),
      "FORBIDDEN",
    );
  });

  it("returns 404 for a manager reading an unassigned recruit", async () => {
    await expectHttpError(
      () => requireOwnerOrScope(otherManager, recruit.id, "read"),
      "NOT_FOUND",
    );
  });

  it("returns 404 for a recruit reading another recruit's data", async () => {
    await expectHttpError(
      () => requireOwnerOrScope(otherRecruit, recruit.id, "read"),
      "NOT_FOUND",
    );
  });

  it("returns 404 for a recruit mutating another recruit's data", async () => {
    await expectHttpError(
      () => requireOwnerOrScope(otherRecruit, recruit.id, "write"),
      "NOT_FOUND",
    );
  });

  it("allows admin read on any user but rejects admin mutation with 403", async () => {
    await requireOwnerOrScope(admin, recruit.id, "read");
    await expectHttpError(
      () => requireOwnerOrScope(admin, recruit.id, "write"),
      "FORBIDDEN",
    );
  });
});

describe("managerOversees", () => {
  it("reflects ManagerAssignment rows", async () => {
    expect(await managerOversees(manager.id, recruit.id)).toBe(true);
    expect(await managerOversees(otherManager.id, recruit.id)).toBe(false);
  });
});
