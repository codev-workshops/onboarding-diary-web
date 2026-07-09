import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";
import type { Role } from "@/lib/validation";

export type SessionUser = { id: string; role: Role };

/** Resolve the current session or throw 401. */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.role) {
    throw new HttpError("UNAUTHENTICATED", "Authentication required");
  }
  return { id: user.id, role: user.role };
}

/** Require the caller to have one of the given roles, else 403. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new HttpError("FORBIDDEN", "Insufficient permissions");
  }
  return user;
}

/** True if `managerId` oversees `recruitId` via ManagerAssignment. */
export async function managerOversees(
  managerId: string,
  recruitId: string,
): Promise<boolean> {
  const assignment = await prisma.managerAssignment.findUnique({
    where: { managerId_recruitId: { managerId, recruitId } },
  });
  return assignment !== null;
}

/**
 * Authorization matrix check for accessing records owned by `ownerId`
 * (docs/REQUIREMENTS.md "Authorization matrix"):
 * - owner: full read/write
 * - manager: read-only for assigned recruits
 * - admin: read-only for any user
 * Out-of-scope reads throw 404 (no ID probing); in-scope non-owner
 * mutations throw 403.
 */
export async function requireOwnerOrScope(
  user: SessionUser,
  ownerId: string,
  action: "read" | "write",
): Promise<void> {
  if (user.id === ownerId) return;
  if (action === "read") {
    if (user.role === "ADMIN") return;
    if (user.role === "MANAGER" && (await managerOversees(user.id, ownerId))) {
      return;
    }
    throw new HttpError("NOT_FOUND", "Not found");
  }
  // Non-owner mutation: 403 when the caller could read it, 404 otherwise.
  if (
    user.role === "ADMIN" ||
    (user.role === "MANAGER" && (await managerOversees(user.id, ownerId)))
  ) {
    throw new HttpError("FORBIDDEN", "Read-only access");
  }
  throw new HttpError("NOT_FOUND", "Not found");
}
