"use client";

import { useState } from "react";

export type ReportUserOption = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: "tasks", label: "Tasks" },
  { value: "issues", label: "Issues" },
  { value: "feedback", label: "Feedback" },
  { value: "combined", label: "Combined (all three)" },
];

export function ReportForm({
  users,
  selfId,
  initialUserId,
}: {
  /** Selectable target users; empty for recruit (self-only). */
  users: ReportUserOption[];
  selfId: string;
  initialUserId?: string;
}) {
  const [userId, setUserId] = useState(
    initialUserId && users.some((u) => u.id === initialUserId)
      ? initialUserId
      : selfId,
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [types, setTypes] = useState("combined");
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function download(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!from || !to) {
      setError("Choose a from and to date.");
      return;
    }
    if (from > to) {
      setError("From must be on or before To.");
      return;
    }
    setPending(true);
    const params = new URLSearchParams({ from, to, types, format });
    if (userId !== selfId) params.set("userId", userId);
    try {
      const res = await fetch(`/api/reports?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Report generation failed");
      }
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = match?.[1] ?? `report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report generation failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={download}
      className="mt-4 max-w-xl space-y-4 rounded bg-white p-4 shadow-sm"
    >
      {users.length > 0 && (
        <label className="block text-sm">
          <span className="text-slate-600">User</span>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="mt-1 block w-full rounded border border-slate-300 p-2"
          >
            <option value={selfId}>Myself</option>
            {users
              .filter((u) => u.id !== selfId)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-600">From</span>
          <input
            type="date"
            value={from}
            required
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block w-full rounded border border-slate-300 p-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">To</span>
          <input
            type="date"
            value={to}
            required
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block w-full rounded border border-slate-300 p-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-slate-600">Entry types</span>
        <select
          value={types}
          onChange={(e) => setTypes(e.target.value)}
          className="mt-1 block w-full rounded border border-slate-300 p-2"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="text-sm">
        <legend className="text-slate-600">Format</legend>
        <div className="mt-1 flex gap-4">
          {(["csv", "pdf"] as const).map((f) => (
            <label key={f} className="flex min-h-[44px] items-center gap-2">
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
              />
              {f.toUpperCase()}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-[44px] rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Generating…" : "Download report"}
      </button>
    </form>
  );
}
