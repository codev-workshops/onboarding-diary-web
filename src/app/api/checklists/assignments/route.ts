import { NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/guards";
import { createAssignment, listAssignments } from "@/lib/checklists";
import { handleRouteError } from "@/lib/errors";
import { checklistAssignmentCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({ items: await listAssignments(user) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("MANAGER", "ADMIN");
    const data = checklistAssignmentCreateSchema.parse(await req.json());
    return NextResponse.json(await createAssignment(user, data), {
      status: 201,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
