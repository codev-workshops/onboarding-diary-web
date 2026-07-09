"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Entry, ModuleDef } from "@/components/entries/config";

const BADGE_COLORS: Record<string, string> = {
  TODO: "bg-slate-200 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
  OPEN: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  LOW: "bg-slate-200 text-slate-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
  POSITIVE: "bg-green-100 text-green-700",
  SUGGESTION: "bg-blue-100 text-blue-700",
  CONCERN: "bg-amber-100 text-amber-700",
  GENERAL: "bg-slate-200 text-slate-700",
  TRAINING: "bg-purple-100 text-purple-700",
  SETUP: "bg-cyan-100 text-cyan-700",
  MEETING: "bg-indigo-100 text-indigo-700",
  DOCUMENTATION: "bg-teal-100 text-teal-700",
  OTHER: "bg-slate-200 text-slate-700",
};

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
        BADGE_COLORS[value] ?? "bg-slate-200 text-slate-700"
      }`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

function cellValue(entry: Entry, key: string): string {
  const value = entry[key];
  if (Array.isArray(value)) return value.join(", ");
  return value == null ? "" : String(value);
}

const PAGE_SIZE = 20;

export function EntryListPage({ def }: { def: ModuleDef }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Entry[]; total: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page) });
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    try {
      const res = await fetch(`${def.apiPath}?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Failed to load");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [def.apiPath, filters, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const filterControls = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {def.filters.map((f) => (
        <label key={f.name} className="block text-sm">
          <span className="text-slate-600">{f.label}</span>
          {f.type === "select" ? (
            <select
              value={filters[f.name] ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, [f.name]: e.target.value });
              }}
              className="mt-1 block w-full rounded border border-slate-300 p-2 sm:w-44"
            >
              <option value="">All</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.name === "from" || f.name === "to" ? "date" : "text"}
              value={filters[f.name] ?? ""}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, [f.name]: e.target.value });
              }}
              className="mt-1 block w-full rounded border border-slate-300 p-2 sm:w-40"
            />
          )}
        </label>
      ))}
      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => {
            setPage(1);
            setFilters({});
          }}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          Clear
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{def.title}</h1>
        <Link
          href={`${def.basePath}/new`}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New {def.singular}
        </Link>
      </div>

      {/* Filter bar: disclosure on mobile, inline above sm */}
      <div className="mt-4 rounded bg-white p-4 shadow-sm">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="min-h-[44px] w-full text-left text-sm font-medium text-slate-700 sm:hidden"
          aria-expanded={filtersOpen}
        >
          Filters {filtersOpen ? "▴" : "▾"}
        </button>
        <div className={`${filtersOpen ? "mt-3 block" : "hidden"} sm:block`}>
          {filterControls}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2" data-testid="skeleton" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}{" "}
            <button onClick={() => void load()} className="font-medium underline">
              Retry
            </button>
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            {Object.values(filters).some(Boolean) ? (
              <>No {def.title.toLowerCase()} match the current filters.</>
            ) : (
              <>
                No {def.title.toLowerCase()} yet.{" "}
                <Link
                  href={`${def.basePath}/new`}
                  className="font-medium text-blue-600 underline"
                >
                  Create your first {def.singular}
                </Link>
              </>
            )}
          </div>
        ) : data ? (
          <>
            {/* Table ≥640px */}
            <div className="hidden overflow-x-auto rounded bg-white shadow-sm sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-500">
                  <tr>
                    {def.columns.map((c) => (
                      <th
                        key={c.key}
                        className={`px-4 py-3 ${c.secondary ? "hidden lg:table-cell" : ""}`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => router.push(`${def.basePath}/${entry.id}/edit`)}
                      className="cursor-pointer border-b last:border-0 hover:bg-slate-50"
                    >
                      {def.columns.map((c) => (
                        <td
                          key={c.key}
                          className={`px-4 py-3 ${c.secondary ? "hidden lg:table-cell" : ""}`}
                        >
                          {c.badge ? (
                            <Badge value={cellValue(entry, c.key)} />
                          ) : (
                            cellValue(entry, c.key)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Stacked cards <640px */}
            <ul className="space-y-2 sm:hidden">
              {data.items.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`${def.basePath}/${entry.id}/edit`}
                    className="block min-h-[44px] rounded bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {cellValue(entry, def.titleKey)}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {entry.date}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {def.columns
                        .filter((c) => c.badge)
                        .map((c) => (
                          <Badge key={c.key} value={cellValue(entry, c.key)} />
                        ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="min-h-[44px] rounded border border-slate-300 px-4 disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages} ({data.total} total)
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="min-h-[44px] rounded border border-slate-300 px-4 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
