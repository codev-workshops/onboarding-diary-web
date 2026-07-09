import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome, {user.name}. You are signed in as{" "}
        <span className="font-medium">{user.role.toLowerCase()}</span>.
      </p>
      <p className="mt-4 rounded border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Summary counts, task progress, and recent entries will appear here in a
        later step (see docs/REQUIREMENTS.md §6).
      </p>
    </div>
  );
}
