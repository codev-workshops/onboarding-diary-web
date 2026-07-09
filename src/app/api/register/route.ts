import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { errorResponse, handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) {
      // Generic message: no account enumeration.
      return errorResponse("VALIDATION_ERROR", "Registration failed");
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash },
    });
    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
