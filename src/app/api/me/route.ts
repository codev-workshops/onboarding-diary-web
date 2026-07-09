import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/guards";
import { updateProfileSchema } from "@/lib/validation";
import { handleRouteError, HttpError } from "@/lib/errors";

function serializeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  startDate: Date | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    startDate: user.startDate ? user.startDate.toISOString().slice(0, 10) : null,
  };
}

export async function GET() {
  try {
    const { id } = await requireAuth();
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError("NOT_FOUND", "Not found");
    return NextResponse.json(serializeUser(user));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await requireAuth();
    const body = updateProfileSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.department !== undefined
          ? { department: body.department }
          : {}),
        ...(body.startDate !== undefined
          ? { startDate: body.startDate ? new Date(body.startDate) : null }
          : {}),
      },
    });
    return NextResponse.json(serializeUser(user));
  } catch (err) {
    return handleRouteError(err);
  }
}
