import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportForm, type ReportUserOption } from "@/components/report-form";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { userId?: string };
}) {
  const session = await auth();
  const user = session!.user;

  // Selector options per docs/REQUIREMENTS.md R3/R4: manager limited to
  // assigned recruits; admin any user; recruit self-only (no selector).
  let users: ReportUserOption[] = [];
  if (user.role === "MANAGER") {
    const assignments = await prisma.managerAssignment.findMany({
      where: { managerId: user.id },
      include: { recruit: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
    users = assignments.map((a) => a.recruit);
  } else if (user.role === "ADMIN") {
    users = await prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
      <p className="mt-1 text-sm text-slate-600">
        Generate a report of entries for a date range and download it as CSV or
        PDF.
      </p>
      <ReportForm
        users={users}
        selfId={user.id}
        initialUserId={searchParams.userId}
      />
    </div>
  );
}
