import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { DashboardChartsSection } from "@/components/dashboard-charts";
import type {
  AdminDashboard,
  ManagerDashboard,
  RecruitDashboard,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const ENTRY_PATHS = {
  task: "/tasks",
  issue: "/issues",
  feedback: "/feedback",
  note: "/notes",
} as const;

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function SeverityList({ counts }: { counts: Record<string, number> }) {
  const entries = SEVERITY_ORDER.filter((s) => counts[s]);
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No open issues.</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {entries.map((s) => (
        <li key={s} className="flex justify-between">
          <span className="text-slate-600">{s.replace(/_/g, " ")}</span>
          <span className="font-medium text-slate-800">{counts[s]}</span>
        </li>
      ))}
    </ul>
  );
}

function RecruitView({ data }: { data: RecruitDashboard }) {
  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tasks"
          value={Object.values(data.taskCounts).reduce((a, b) => a + b, 0)}
        />
        <StatCard label="Open issues" value={data.openIssues} />
        <StatCard label="Feedback" value={data.feedbackCount} />
        <StatCard label="Notes" value={data.noteCount} />
      </div>

      <DashboardChartsSection charts={data.charts} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Task completion
          </h2>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${data.completionPct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {data.completionPct}% done ({data.taskCounts.DONE} of{" "}
            {Object.values(data.taskCounts).reduce((a, b) => a + b, 0)} tasks)
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(data.taskCounts).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-slate-600">
                  {status.replace(/_/g, " ")}
                </span>
                <span className="font-medium text-slate-800">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Open issues by severity
          </h2>
          <div className="mt-3">
            <SeverityList counts={data.openIssuesBySeverity} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Recent entries</h2>
        {data.recent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No entries yet.{" "}
            <Link href="/tasks/new" className="text-blue-600 underline">
              Create your first task
            </Link>
          </p>
        ) : (
          <ul className="mt-2 divide-y">
            {data.recent.map((e) => (
              <li key={`${e.type}-${e.id}`}>
                <Link
                  href={`${ENTRY_PATHS[e.type]}/${e.id}/edit`}
                  className="flex min-h-[44px] items-center justify-between gap-2 py-2 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {e.type}
                    </span>
                    <span className="text-sm text-slate-800">{e.title}</span>
                  </span>
                  <span className="text-xs text-slate-500">{e.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function checklistLabel(
  checklist: { completed: number; total: number; pct: number } | null,
): string {
  if (!checklist || checklist.total === 0) return "—";
  return `${checklist.pct}% (${checklist.completed}/${checklist.total})`;
}

function ManagerView({ data }: { data: ManagerDashboard }) {
  return (
    <>
      <div className="mt-4 rounded bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">My recruits</h2>
        {data.recruits.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No recruits assigned to you yet.
          </p>
        ) : (
          <>
            {/* Table ≥640px */}
            <div className="mt-2 hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Recruit</th>
                    <th className="px-4 py-3">Task completion</th>
                    <th className="px-4 py-3">Open issues</th>
                    <th className="px-4 py-3">Checklist</th>
                    <th className="px-4 py-3">Last activity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recruits.map((r) => (
                    <tr key={r.userId} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/recruits/${r.userId}`}
                          className="font-medium text-blue-600 underline"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{r.completionPct}%</td>
                      <td className="px-4 py-3">{r.openIssues}</td>
                      <td className="px-4 py-3">{checklistLabel(r.checklist)}</td>
                      <td className="px-4 py-3">{r.lastActivity ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Stacked cards <640px */}
            <ul className="mt-2 space-y-2 sm:hidden">
              {data.recruits.map((r) => (
                <li key={r.userId}>
                  <Link
                    href={`/recruits/${r.userId}`}
                    className="block min-h-[44px] rounded border border-slate-200 p-3"
                  >
                    <span className="font-medium text-blue-600 underline">
                      {r.name}
                    </span>
                    <p className="mt-1 text-xs text-slate-600">
                      {r.completionPct}% tasks done · {r.openIssues} open issues ·
                      checklist {checklistLabel(r.checklist)} · last activity{" "}
                      {r.lastActivity ?? "—"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <DashboardChartsSection charts={data.charts} />
    </>
  );
}

function AdminView({ data }: { data: AdminDashboard }) {
  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tasks" value={data.totals.tasks} />
        <StatCard label="Issues" value={data.totals.issues} />
        <StatCard label="Feedback" value={data.totals.feedback} />
        <StatCard label="Notes" value={data.totals.notes} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Users by role
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {["RECRUIT", "MANAGER", "ADMIN"].map((role) => (
              <li key={role} className="flex justify-between">
                <span className="text-slate-600">{role.toLowerCase()}</span>
                <span className="font-medium text-slate-800">
                  {data.usersByRole[role] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Open issues by severity (org-wide)
          </h2>
          <div className="mt-2">
            <SeverityList counts={data.openIssuesBySeverity} />
          </div>
        </div>
      </div>
      <DashboardChartsSection charts={data.charts} />
    </>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;
  const data = await getDashboard({ id: user.id, role: user.role });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Welcome, {user.name}. You are signed in as{" "}
        <span className="font-medium">{user.role.toLowerCase()}</span>.
      </p>
      {data.role === "RECRUIT" && <RecruitView data={data} />}
      {data.role === "MANAGER" && <ManagerView data={data} />}
      {data.role === "ADMIN" && <AdminView data={data} />}
    </div>
  );
}
