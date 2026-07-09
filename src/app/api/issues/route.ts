import { createEntry, listEntries } from "@/lib/entries";
import { handleRouteError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    return await listEntries("issues", req);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    return await createEntry("issues", req);
  } catch (err) {
    return handleRouteError(err);
  }
}
