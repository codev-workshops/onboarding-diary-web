import {
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  FEEDBACK_TYPES,
} from "@/lib/validation";

export type Entry = { id: string; date: string } & Record<string, unknown>;

export type FieldDef = {
  name: string;
  label: string;
  type: "date" | "text" | "textarea" | "select" | "tags";
  options?: readonly string[];
  required?: boolean;
  defaultValue?: string;
};

export type ColumnDef = {
  key: string;
  label: string;
  badge?: boolean;
  /** Hidden between 640–1023px per the responsive breakpoints table. */
  secondary?: boolean;
};

export type FilterDef = {
  name: string;
  label: string;
  type: "select" | "text";
  options?: readonly string[];
};

export type ModuleDef = {
  module: string;
  title: string;
  singular: string;
  apiPath: string;
  basePath: string;
  titleKey: string;
  columns: ColumnDef[];
  filters: FilterDef[];
  fields: FieldDef[];
};

const dateRangeFilters: FilterDef[] = [
  { name: "from", label: "From", type: "text" },
  { name: "to", label: "To", type: "text" },
];

export const TASKS_MODULE: ModuleDef = {
  module: "tasks",
  title: "Tasks",
  singular: "task",
  apiPath: "/api/tasks",
  basePath: "/tasks",
  titleKey: "title",
  columns: [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "category", label: "Category", badge: true, secondary: true },
    { key: "status", label: "Status", badge: true },
    { key: "priority", label: "Priority", badge: true, secondary: true },
  ],
  filters: [
    ...dateRangeFilters,
    { name: "category", label: "Category", type: "select", options: TASK_CATEGORIES },
    { name: "status", label: "Status", type: "select", options: TASK_STATUSES },
  ],
  fields: [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "category", label: "Category", type: "select", options: TASK_CATEGORIES, required: true },
    { name: "status", label: "Status", type: "select", options: TASK_STATUSES, required: true },
    { name: "priority", label: "Priority", type: "select", options: TASK_PRIORITIES, required: true, defaultValue: "MEDIUM" },
    { name: "description", label: "Description", type: "textarea" },
  ],
};

export const ISSUES_MODULE: ModuleDef = {
  module: "issues",
  title: "Issues",
  singular: "issue",
  apiPath: "/api/issues",
  basePath: "/issues",
  titleKey: "title",
  columns: [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "severity", label: "Severity", badge: true },
    { key: "status", label: "Status", badge: true, secondary: true },
  ],
  filters: [
    { name: "status", label: "Status", type: "select", options: ISSUE_STATUSES },
    { name: "severity", label: "Severity", type: "select", options: ISSUE_SEVERITIES },
    ...dateRangeFilters,
  ],
  fields: [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "severity", label: "Severity", type: "select", options: ISSUE_SEVERITIES, required: true },
    { name: "status", label: "Status", type: "select", options: ISSUE_STATUSES, required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "resolutionNotes", label: "Resolution notes", type: "textarea" },
  ],
};

export const FEEDBACK_MODULE: ModuleDef = {
  module: "feedback",
  title: "Feedback",
  singular: "feedback entry",
  apiPath: "/api/feedback",
  basePath: "/feedback",
  titleKey: "subject",
  columns: [
    { key: "subject", label: "Subject" },
    { key: "date", label: "Date" },
    { key: "type", label: "Type", badge: true },
  ],
  filters: [
    { name: "type", label: "Type", type: "select", options: FEEDBACK_TYPES },
    ...dateRangeFilters,
  ],
  fields: [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "type", label: "Type", type: "select", options: FEEDBACK_TYPES, required: true },
    { name: "details", label: "Details", type: "textarea", required: true },
  ],
};

export const NOTES_MODULE: ModuleDef = {
  module: "notes",
  title: "Notes",
  singular: "note",
  apiPath: "/api/notes",
  basePath: "/notes",
  titleKey: "title",
  columns: [
    { key: "title", label: "Title" },
    { key: "date", label: "Date" },
    { key: "tags", label: "Tags", secondary: true },
  ],
  filters: [
    { name: "tag", label: "Tag", type: "text" },
    ...dateRangeFilters,
  ],
  fields: [
    { name: "date", label: "Date", type: "date", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "content", label: "Content", type: "textarea", required: true },
    { name: "tags", label: "Tags (comma-separated)", type: "tags" },
  ],
};
