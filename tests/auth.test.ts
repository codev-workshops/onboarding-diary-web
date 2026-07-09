import { beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { POST as registerPOST } from "@/app/api/register/route";
import { verifyCredentials } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function registerRequest(body: unknown) {
  return new Request("http://test/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/register", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  it("creates a recruit account with valid input", async () => {
    const res = await registerPOST(
      registerRequest({
        email: "New.User@Example.com",
        password: "secret123",
        name: "New User",
      }),
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.role).toBe("RECRUIT");
    expect(data.email).toBe("new.user@example.com"); // lowercased
    expect(data.passwordHash).toBeUndefined();

    const user = await prisma.user.findUnique({
      where: { email: "new.user@example.com" },
    });
    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toContain("secret123");
    expect(await bcrypt.compare("secret123", user!.passwordHash)).toBe(true);
  });

  it("rejects invalid email and weak password with field errors", async () => {
    const res = await registerPOST(
      registerRequest({ email: "not-an-email", password: "short", name: "" }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.fields.email).toBeDefined();
    expect(data.error.fields.password).toBeDefined();
    expect(data.error.fields.name).toBeDefined();
  });

  it("rejects a password without a digit", async () => {
    const res = await registerPOST(
      registerRequest({
        email: "x@example.com",
        password: "onlyletters",
        name: "X",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns a generic error for duplicate email (no enumeration)", async () => {
    const res = await registerPOST(
      registerRequest({
        email: "new.user@example.com",
        password: "secret123",
        name: "Dup",
      }),
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.message).toBe("Registration failed");
    expect(JSON.stringify(data)).not.toMatch(/exist|taken|already/i);
  });
});

describe("verifyCredentials (login)", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    const passwordHash = await bcrypt.hash("passw0rd1", 12);
    await prisma.user.create({
      data: {
        email: "login@example.com",
        name: "Login User",
        passwordHash,
        role: "MANAGER",
      },
    });
    await prisma.user.create({
      data: {
        email: "inactive@example.com",
        name: "Gone",
        passwordHash,
        active: false,
      },
    });
  });

  it("returns id and role for valid credentials", async () => {
    const user = await verifyCredentials("login@example.com", "passw0rd1");
    expect(user).not.toBeNull();
    expect(user!.role).toBe("MANAGER");
    expect(user!.id).toBeTruthy();
  });

  it("returns null for a wrong password", async () => {
    expect(await verifyCredentials("login@example.com", "wrong1234")).toBeNull();
  });

  it("returns null for an unknown email", async () => {
    expect(await verifyCredentials("nobody@example.com", "passw0rd1")).toBeNull();
  });

  it("returns null for a deactivated user", async () => {
    expect(await verifyCredentials("inactive@example.com", "passw0rd1")).toBeNull();
  });
});
