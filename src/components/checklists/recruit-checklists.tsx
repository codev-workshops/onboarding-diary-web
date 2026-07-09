"use client";

import { useState } from "react";
import type { ChecklistAssignmentDto } from "@/lib/checklists";

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-green-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function RecruitChecklists({
  initialAssignments,
}: {
  initialAssignments: ChecklistAssignmentDto[];
}) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [error, setError] = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<string | null>(null);

  async function toggle(assignmentId: string, itemId: string, done: boolean) {
    setError(null);
    setPendingItem(itemId);
    try {
      const res = await fetch(
        `/api/checklists/assignments/${assignmentId}/items/${itemId}/completion`,
        { method: done ? "DELETE" : "PUT" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Update failed");
      }
      const updated: ChecklistAssignmentDto = await res.json();
      setAssignments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPendingItem(null);
    }
  }

  if (assignments.length === 0) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        No checklists assigned to you yet.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      {assignments.map((a) => (
        <div key={a.id} className="rounded bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-700">
              {a.templateTitle}
            </h2>
            <span className="text-sm font-medium text-slate-600">
              {a.progressPct}% ({a.completedCount}/{a.totalCount})
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar pct={a.progressPct} />
          </div>
          <ul className="mt-3 space-y-1">
            {a.items.map((item) => (
              <li key={item.id}>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded px-1 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    disabled={pendingItem === item.id}
                    onChange={() => toggle(a.id, item.id, item.completed)}
                    className="h-4 w-4"
                  />
                  <span
                    className={
                      item.completed
                        ? "text-sm text-slate-400 line-through"
                        : "text-sm text-slate-800"
                    }
                  >
                    {item.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
