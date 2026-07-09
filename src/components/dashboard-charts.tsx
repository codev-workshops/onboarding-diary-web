"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardCharts } from "@/lib/dashboard";

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  DONE: "#22c55e",
  BLOCKED: "#ef4444",
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#94a3b8",
};

const TYPE_COLORS = {
  tasks: "#3b82f6",
  issues: "#ef4444",
  feedback: "#a855f7",
  notes: "#22c55e",
} as const;

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  // recharts measures the DOM, so render only after mount to avoid
  // hydration mismatches; show a loading skeleton until then.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="rounded bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <div className="mt-3 h-64">
        {!mounted ? (
          <div
            className="h-full animate-pulse rounded bg-slate-100"
            aria-label="Loading chart"
          />
        ) : empty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">No data yet.</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function TaskStatusDonut({ data }: { data: DashboardCharts["taskStatus"] }) {
  const slices = data.filter((d) => d.count > 0);
  return (
    <ChartCard title="Tasks by status" empty={slices.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="count"
            nameKey="status"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {slices.map((d) => (
              <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? "#64748b"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function IssueSeverityBar({
  data,
}: {
  data: DashboardCharts["issuesBySeverity"];
}) {
  const empty = data.every((d) => d.count === 0);
  return (
    <ChartCard title="Open issues by severity" empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="severity" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
          <Tooltip />
          <Bar dataKey="count" name="Open issues">
            {data.map((d) => (
              <Cell
                key={d.severity}
                fill={SEVERITY_COLORS[d.severity] ?? "#64748b"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ActivityTimeline({
  data,
}: {
  data: DashboardCharts["activityTimeline"];
}) {
  const empty = data.every(
    (d) => d.tasks + d.issues + d.feedback + d.notes === 0,
  );
  return (
    <ChartCard title="Activity — last 14 days" empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(d: string) => d.slice(5)}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
          <Tooltip />
          <Legend />
          {(Object.keys(TYPE_COLORS) as (keyof typeof TYPE_COLORS)[]).map(
            (key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={TYPE_COLORS[key]}
                strokeWidth={2}
                dot={false}
              />
            ),
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DashboardChartsSection({
  charts,
}: {
  charts: DashboardCharts;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TaskStatusDonut data={charts.taskStatus} />
      <IssueSeverityBar data={charts.issuesBySeverity} />
      <div className="lg:col-span-2">
        <ActivityTimeline data={charts.activityTimeline} />
      </div>
    </div>
  );
}
