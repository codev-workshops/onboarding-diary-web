import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { managerOversees } from "@/lib/guards";
import { RecruitEntriesTabs } from "@/components/entries/recruit-entries-tabs";

export const dynamic = "force-dynamic";

function ForbiddenPage() {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-700">403 — Forbidden</h1>
      <p className="mt-1 text-sm text-red-700">
        You do not have access to this page.
      </p>
      <Link
        href="/dashboard"
        className="mt-3 inline-block text-sm font-medium text-blue-600 underline"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

export default async function RecruitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const user = session!.user;

  // Screen #12 is manager/admin only; wrong role → 403 page (docs/UI_FLOWS.md).
  if (user.role !== "MANAGER" && user.role !== "ADMIN") {
    return <ForbiddenPage />;
  }
  // Managers may only open assigned recruits; out-of-scope → 404 (no ID probing).
  if (user.role === "MANAGER" && !(await managerOversees(user.id, params.id))) {
    notFound();
  }
  const recruit = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, role: true, department: true },
  });
  if (!recruit || recruit.role !== "RECRUIT") notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{recruit.name}</h1>
      <p className="mt-1 text-sm text-slate-600">
        Recruit{recruit.department ? ` · ${recruit.department}` : ""} —
        read-only view of their entries.{" "}
        <Link
          href={`/reports?userId=${recruit.id}`}
          className="font-medium text-blue-600 underline"
        >
          Generate report
        </Link>
      </p>
      <RecruitEntriesTabs userId={recruit.id} />
    </div>
  );
}
