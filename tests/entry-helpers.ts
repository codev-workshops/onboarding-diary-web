import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/guards";

/** Mutable session used by the per-file `@/lib/auth` mock. */
export const sessionRef: {
  current: { user: { id: string; role: string } } | null;
} = { current: null };

export function actAs(user: SessionUser | null) {
  sessionRef.current = user ? { user: { id: user.id, role: user.role } } : null;
}

export type Fixture = {
  recruit: SessionUser;
  otherRecruit: SessionUser;
  manager: SessionUser;
  otherManager: SessionUser;
  admin: SessionUser;
};

/** Reset users/entries and create the standard authorization-matrix cast. */
export async function seedUsers(prefix: string): Promise<Fixture> {
  await prisma.taskEntry.deleteMany();
  await prisma.issueEntry.deleteMany();
  await prisma.feedbackEntry.deleteMany();
  await prisma.noteEntry.deleteMany();
  await prisma.managerAssignment.deleteMany();
  await prisma.user.deleteMany();
  const mk = (email: string, role: string) =>
    prisma.user.create({
      data: { email: `${prefix}-${email}`, name: email, role, passwordHash: "x" },
    });
  const r1 = await mk("recruit@example.com", "RECRUIT");
  const r2 = await mk("recruit2@example.com", "RECRUIT");
  const m1 = await mk("manager@example.com", "MANAGER");
  const m2 = await mk("manager2@example.com", "MANAGER");
  const a1 = await mk("admin@example.com", "ADMIN");
  await prisma.managerAssignment.create({
    data: { managerId: m1.id, recruitId: r1.id },
  });
  return {
    recruit: { id: r1.id, role: "RECRUIT" },
    otherRecruit: { id: r2.id, role: "RECRUIT" },
    manager: { id: m1.id, role: "MANAGER" },
    otherManager: { id: m2.id, role: "MANAGER" },
    admin: { id: a1.id, role: "ADMIN" },
  };
}

export function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
): Request {
  return new Request(`http://test${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
