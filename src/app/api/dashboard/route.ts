import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";
import { getDashboard } from "@/lib/dashboard";
import { handleRouteError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json(await getDashboard(user));
  } catch (err) {
    return handleRouteError(err);
  }
}
