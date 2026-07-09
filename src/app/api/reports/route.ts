import { requireAuth } from "@/lib/guards";
import { handleRouteError } from "@/lib/errors";
import {
  gatherReportData,
  reportFilename,
  reportQuerySchema,
  reportToCsv,
  reportToPdf,
  resolveReportUser,
} from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const query = reportQuerySchema.parse(params);
    const target = await resolveReportUser(user, query.userId);
    const data = await gatherReportData(target, query);
    const filename = reportFilename(
      target.name,
      query.from,
      query.to,
      query.format,
    );

    if (query.format === "csv") {
      return new Response(reportToCsv(data), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
    const pdf = await reportToPdf(data);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
