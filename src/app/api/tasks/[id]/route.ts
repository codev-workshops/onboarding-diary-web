import { deleteEntry, getEntry, patchEntry } from "@/lib/entries";
import { handleRouteError } from "@/lib/errors";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    return await getEntry("tasks", params.id);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    return await patchEntry("tasks", params.id, req);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    return await deleteEntry("tasks", params.id);
  } catch (err) {
    return handleRouteError(err);
  }
}
