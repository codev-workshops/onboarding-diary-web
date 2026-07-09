"use client";

import { useState } from "react";
import type {
  ChecklistAssignmentDto,
  ChecklistTemplateDto,
} from "@/lib/checklists";
import { ProgressBar } from "@/components/checklists/recruit-checklists";

export type RecruitOption = { id: string; name: string };

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error?.message ?? "Request failed";
}

function TemplateForm({
  onCreated,
}: {
  onCreated: (t: ChecklistTemplateDto) => void;
}) {
  const [title, setTitle] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const items = itemsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!title.trim() || items.length === 0) {
      setError("Provide a title and at least one item (one per line).");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/checklists/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), items }),
      });
      if (!res.ok) throw new Error(await readError(res));
      onCreated(await res.json());
      setTitle("");
      setItemsText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">New template</h2>
      {error && (
        <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="mt-3 block text-sm">
        <span className="text-slate-600">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          placeholder="e.g. First-week onboarding"
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-slate-600">Items (one per line, in order)</span>
        <textarea
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          placeholder={"Set up laptop\nMeet your manager\nRead the handbook"}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-3 min-h-[44px] rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create template"}
      </button>
    </form>
  );
}

function AssignForm({
  templates,
  recruits,
  onAssigned,
}: {
  templates: ChecklistTemplateDto[];
  recruits: RecruitOption[];
  onAssigned: (a: ChecklistAssignmentDto) => void;
}) {
  const [templateId, setTemplateId] = useState("");
  const [recruitId, setRecruitId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!templateId || !recruitId) {
      setError("Choose a template and a recruit.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/checklists/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, recruitId }),
      });
      if (!res.ok) throw new Error(await readError(res));
      onAssigned(await res.json());
      setTemplateId("");
      setRecruitId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">
        Assign a template
      </h2>
      {error && (
        <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-slate-600">Template</span>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Choose…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">Recruit</span>
          <select
            value={recruitId}
            onChange={(e) => setRecruitId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Choose…</option>
            {recruits.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-3 min-h-[44px] rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Assigning…" : "Assign"}
      </button>
    </form>
  );
}

export function ChecklistManage({
  initialTemplates,
  initialAssignments,
  recruits,
}: {
  initialTemplates: ChecklistTemplateDto[];
  initialAssignments: ChecklistAssignmentDto[];
  recruits: RecruitOption[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [error, setError] = useState<string | null>(null);

  async function removeTemplate(id: string) {
    setError(null);
    const res = await fetch(`/api/checklists/templates/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await readError(res));
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setAssignments((prev) => prev.filter((a) => a.templateId !== id));
  }

  async function removeAssignment(id: string) {
    setError(null);
    const res = await fetch(`/api/checklists/assignments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError(await readError(res));
      return;
    }
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="mt-4 space-y-4">
      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TemplateForm
          onCreated={(t) => setTemplates((prev) => [...prev, t])}
        />
        <AssignForm
          templates={templates}
          recruits={recruits}
          onAssigned={(a) => setAssignments((prev) => [...prev, a])}
        />
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Templates</h2>
        {templates.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No templates yet.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {templates.map((t) => (
              <li key={t.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.items.length} items · {t.assignmentCount} assignment
                      {t.assignmentCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTemplate(t.id)}
                    className="min-h-[44px] rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
                <ol className="mt-1 list-inside list-decimal text-sm text-slate-600">
                  {t.items.map((i) => (
                    <li key={i.id}>{i.text}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">
          Assigned checklists
        </h2>
        {assignments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No assignments yet.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {assignments.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {a.recruitName} — {a.templateTitle}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-40">
                        <ProgressBar pct={a.progressPct} />
                      </div>
                      <span className="text-xs text-slate-600">
                        {a.progressPct}% ({a.completedCount}/{a.totalCount})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAssignment(a.id)}
                    className="min-h-[44px] rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
