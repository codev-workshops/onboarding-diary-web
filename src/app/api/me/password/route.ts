import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/guards";
import { changePasswordSchema } from "@/lib/validation";
import { errorResponse, handleRouteError, HttpError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { id } = await requireAuth();
    const body = changePasswordSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError("NOT_FOUND", "Not found");
    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) {
      return errorResponse("VALIDATION_ERROR", "Current password is incorrect");
    }
    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
