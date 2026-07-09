import { deleteEntry, getEntry, patchEntry } from "@/lib/entries";
import { handleRouteError } from "@/lib/errors";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    return await getEntry("feedback", params.id);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    return await patchEntry("feedback", params.id, req);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    return await deleteEntry("feedback", params.id);
  } catch (err) {
    return handleRouteError(err);
  }
}
