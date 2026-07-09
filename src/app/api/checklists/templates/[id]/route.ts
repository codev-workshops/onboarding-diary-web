import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import {
  deleteTemplate,
  getTemplate,
  updateTemplate,
} from "@/lib/checklists";
import { handleRouteError } from "@/lib/errors";
import { checklistTemplatePatchSchema } from "@/lib/validation";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireRole("MANAGER", "ADMIN");
    return NextResponse.json(await getTemplate(params.id));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireRole("MANAGER", "ADMIN");
    const data = checklistTemplatePatchSchema.parse(await req.json());
    return NextResponse.json(await updateTemplate(params.id, data));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await requireRole("MANAGER", "ADMIN");
    await deleteTemplate(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
