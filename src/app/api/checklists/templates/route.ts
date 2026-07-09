import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { createTemplate, listTemplates } from "@/lib/checklists";
import { handleRouteError } from "@/lib/errors";
import { checklistTemplateCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireRole("MANAGER", "ADMIN");
    return NextResponse.json({ items: await listTemplates() });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRole("MANAGER", "ADMIN");
    const data = checklistTemplateCreateSchema.parse(await req.json());
    return NextResponse.json(await createTemplate(user, data), { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
