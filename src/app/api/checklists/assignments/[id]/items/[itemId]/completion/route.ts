import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";
import { setItemCompletion } from "@/lib/checklists";
import { handleRouteError } from "@/lib/errors";

type Ctx = { params: { id: string; itemId: string } };

export async function PUT(_req: Request, { params }: Ctx) {
  try {
    const user = await requireAuth();
    return NextResponse.json(
      await setItemCompletion(user, params.id, params.itemId, true),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireAuth();
    return NextResponse.json(
      await setItemCompletion(user, params.id, params.itemId, false),
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
