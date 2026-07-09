import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";
import { deleteAssignment, getAssignment } from "@/lib/checklists";
import { handleRouteError } from "@/lib/errors";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireAuth();
    return NextResponse.json(await getAssignment(user, params.id));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireAuth();
    await deleteAssignment(user, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
