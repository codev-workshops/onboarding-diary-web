"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Entry, FieldDef, ModuleDef } from "@/components/entries/config";

function initialValue(field: FieldDef, entry: Entry | null): string {
  if (!entry) {
    if (field.type === "date") return new Date().toISOString().slice(0, 10);
    if (field.type === "select") return field.options?.[0] ?? "";
    return "";
  }
  const value = entry[field.name];
  if (Array.isArray(value)) return value.join(", ");
  return value == null ? "" : String(value);
}

export function EntryForm({ def, id }: { def: ModuleDef; id?: string }) {
  const router = useRouter();
  const editing = Boolean(id);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!editing) {
      setValues(
        Object.fromEntries(def.fields.map((f) => [f.name, initialValue(f, null)])),
      );
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${def.apiPath}/${id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? "Failed to load");
        }
        const data = (await res.json()) as Entry;
        if (cancelled) return;
        setEntry(data);
        setValues(
          Object.fromEntries(def.fields.map((f) => [f.name, initialValue(f, data)])),
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [def, editing, id]);

  function buildBody(): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const field of def.fields) {
      const raw = values[field.name] ?? "";
      if (field.type === "tags") {
        body[field.name] = raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (raw === "" && !field.required) {
        body[field.name] = null;
      } else {
        body[field.name] = raw;
      }
    }
    return body;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const res = await fetch(editing ? `${def.apiPath}/${id}` : def.apiPath, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      if (res.ok) {
        router.push(def.basePath);
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => null);
      if (body?.error?.fields) setFieldErrors(body.error.fields);
      setFormError(body?.error?.message ?? "Request failed");
    } catch {
      setFormError("Network error");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    setPending(true);
    setFormError(null);
    try {
      const res = await fetch(`${def.apiPath}/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(def.basePath);
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => null);
      setFormError(body?.error?.message ?? "Delete failed");
      setConfirmDelete(false);
    } catch {
      setFormError("Network error");
      setConfirmDelete(false);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {loadError}{" "}
        <Link href={def.basePath} className="font-medium underline">
          Back to {def.title.toLowerCase()}
        </Link>
      </div>
    );
  }

  const input = "mt-1 w-full rounded border border-slate-300 p-2";

  return (
    <div className="pb-24 lg:pb-0">
      <h1 className="text-2xl font-bold text-slate-800">
        {editing ? `Edit ${def.singular}` : `New ${def.singular}`}
      </h1>
      {editing && entry && (
        <p className="mt-1 text-xs text-slate-500">
          Created {String(entry.createdAt).slice(0, 10)} · Updated{" "}
          {String(entry.updatedAt).slice(0, 10)}
        </p>
      )}
      <form
        onSubmit={submit}
        className="mt-4 rounded bg-white p-6 shadow-sm"
        noValidate
      >
        {formError && (
          <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {def.fields.map((field) => (
            <label
              key={field.name}
              className={`block text-sm ${field.type === "textarea" ? "lg:col-span-2" : ""}`}
            >
              <span className="text-slate-600">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </span>
              {field.type === "select" ? (
                <select
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [field.name]: e.target.value })
                  }
                  className={input}
                >
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  rows={5}
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [field.name]: e.target.value })
                  }
                  className={input}
                />
              ) : (
                <input
                  type={field.type === "date" ? "date" : "text"}
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [field.name]: e.target.value })
                  }
                  className={input}
                />
              )}
              {fieldErrors[field.name] && (
                <span className="mt-1 block text-xs text-red-600">
                  {fieldErrors[field.name]}
                </span>
              )}
            </label>
          ))}
        </div>
        {/* Sticky bottom action bar on mobile */}
        <div className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t bg-white p-3 lg:static lg:mt-6 lg:border-0 lg:p-0">
          <button
            type="submit"
            disabled={pending}
            className="min-h-[44px] rounded bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : editing ? "Save changes" : `Create ${def.singular}`}
          </button>
          <Link
            href={def.basePath}
            className="flex min-h-[44px] items-center rounded border border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Link>
          {editing && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
              className="ml-auto min-h-[44px] rounded border border-red-300 px-4 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {confirmDelete && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full rounded bg-white p-6 shadow-lg sm:max-w-sm">
            <h2 className="font-semibold text-slate-800">
              Delete this {def.singular}?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This action cannot be undone.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => void remove()}
                disabled={pending}
                className="min-h-[44px] rounded bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
                className="min-h-[44px] rounded border border-slate-300 px-4 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
