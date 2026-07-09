import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";
import {
  managerOversees,
  requireAuth,
  requireOwnerOrScope,
  type SessionUser,
} from "@/lib/guards";
import {
  listQuerySchema,
  taskCreateSchema,
  taskPatchSchema,
  issueCreateSchema,
  issuePatchSchema,
  feedbackCreateSchema,
  feedbackPatchSchema,
  noteCreateSchema,
  notePatchSchema,
  TASK_CATEGORIES,
  TASK_STATUSES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  FEEDBACK_TYPES,
} from "@/lib/validation";

export type EntryModule = "tasks" | "issues" | "feedback" | "notes";

type EntryRecord = { id: string; authorId: string } & Record<string, unknown>;

type Delegate = {
  findMany: (args: object) => Promise<EntryRecord[]>;
  findUnique: (args: object) => Promise<EntryRecord | null>;
  count: (args: object) => Promise<number>;
  create: (args: object) => Promise<EntryRecord>;
  update: (args: object) => Promise<EntryRecord>;
  delete: (args: object) => Promise<EntryRecord>;
};

type ModuleConfig = {
  delegate: () => Delegate;
  createSchema: z.ZodTypeAny;
  patchSchema: z.ZodTypeAny;
  /** Module-specific list filters (AND-combined with date range/author). */
  filterSchema: z.ZodTypeAny;
  buildFilterWhere: (filters: Record<string, string>) => Record<string, unknown>;
  toRecord: (data: Record<string, unknown>) => Record<string, unknown>;
  serialize: (record: EntryRecord) => Record<string, unknown>;
};

function dateOnly(value: unknown): string {
  return (value as Date).toISOString().slice(0, 10);
}

function iso(value: unknown): string {
  return (value as Date).toISOString();
}

export function tagsToArray(tags: string): string[] {
  return tags === "" ? [] : tags.split(",");
}

function baseSerialize(record: EntryRecord) {
  return {
    id: record.id,
    authorId: record.authorId,
    date: dateOnly(record.date),
    createdAt: iso(record.createdAt),
    updatedAt: iso(record.updatedAt),
  };
}

function withDate(data: Record<string, unknown>): Record<string, unknown> {
  const { date, ...rest } = data;
  return {
    ...rest,
    ...(date !== undefined ? { date: new Date(`${date}T00:00:00.000Z`) } : {}),
  };
}

const MODULES: Record<EntryModule, ModuleConfig> = {
  tasks: {
    delegate: () => prisma.taskEntry as unknown as Delegate,
    createSchema: taskCreateSchema,
    patchSchema: taskPatchSchema,
    filterSchema: z.object({
      category: z.enum(TASK_CATEGORIES).optional(),
      status: z.enum(TASK_STATUSES).optional(),
    }),
    buildFilterWhere: (f) => ({
      ...(f.category ? { category: f.category } : {}),
      ...(f.status ? { status: f.status } : {}),
    }),
    toRecord: withDate,
    serialize: (r) => ({
      ...baseSerialize(r),
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      priority: r.priority,
    }),
  },
  issues: {
    delegate: () => prisma.issueEntry as unknown as Delegate,
    createSchema: issueCreateSchema,
    patchSchema: issuePatchSchema,
    filterSchema: z.object({
      status: z.enum(ISSUE_STATUSES).optional(),
      severity: z.enum(ISSUE_SEVERITIES).optional(),
    }),
    buildFilterWhere: (f) => ({
      ...(f.status ? { status: f.status } : {}),
      ...(f.severity ? { severity: f.severity } : {}),
    }),
    toRecord: withDate,
    serialize: (r) => ({
      ...baseSerialize(r),
      title: r.title,
      description: r.description,
      severity: r.severity,
      status: r.status,
      resolutionNotes: r.resolutionNotes,
    }),
  },
  feedback: {
    delegate: () => prisma.feedbackEntry as unknown as Delegate,
    createSchema: feedbackCreateSchema,
    patchSchema: feedbackPatchSchema,
    filterSchema: z.object({
      type: z.enum(FEEDBACK_TYPES).optional(),
    }),
    buildFilterWhere: (f) => ({ ...(f.type ? { type: f.type } : {}) }),
    toRecord: withDate,
    serialize: (r) => ({
      ...baseSerialize(r),
      subject: r.subject,
      type: r.type,
      details: r.details,
    }),
  },
  notes: {
    delegate: () => prisma.noteEntry as unknown as Delegate,
    createSchema: noteCreateSchema,
    patchSchema: notePatchSchema,
    filterSchema: z.object({
      tag: z.string().trim().min(1).max(30).optional(),
    }),
    buildFilterWhere: () => ({}), // tag filtering applied in-memory (comma-separated storage)
    toRecord: (data) => {
      const { tags, ...rest } = withDate(data);
      return {
        ...rest,
        ...(tags !== undefined ? { tags: (tags as string[]).join(",") } : {}),
      };
    },
    serialize: (r) => ({
      ...baseSerialize(r),
      title: r.title,
      content: r.content,
      tags: tagsToArray(r.tags as string),
    }),
  },
};

/**
 * Resolve the author whose entries a list request targets
 * (docs/API_SPEC.md: manager/admin may pass `?userId=` for scoped reads).
 * Recruits may not target other users (403); managers may only target
 * assigned recruits (404, no ID probing).
 */
async function resolveListAuthor(
  user: SessionUser,
  userId: string | undefined,
): Promise<string> {
  if (!userId || userId === user.id) return user.id;
  if (user.role === "ADMIN") return userId;
  if (user.role === "MANAGER") {
    if (await managerOversees(user.id, userId)) return userId;
    throw new HttpError("NOT_FOUND", "Not found");
  }
  throw new HttpError("FORBIDDEN", "Insufficient permissions");
}

function dateRangeWhere(from?: string, to?: string) {
  if (!from && !to) return {};
  return {
    date: {
      ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { lte: new Date(`${to}T00:00:00.000Z`) } : {}),
    },
  };
}

export async function listEntries(module: EntryModule, req: Request) {
  const config = MODULES[module];
  const user = await requireAuth();
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const query = listQuerySchema.parse(params);
  const filters = config.filterSchema.parse(params) as Record<string, string>;
  const authorId = await resolveListAuthor(user, query.userId);

  const where = {
    authorId,
    ...dateRangeWhere(query.from, query.to),
    ...config.buildFilterWhere(filters),
  };

  if (module === "notes" && filters.tag) {
    // Comma-separated storage: filter by tag in memory, then paginate.
    const all = await config.delegate().findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    const matching = all.filter((r) =>
      tagsToArray(r.tags as string).includes(filters.tag),
    );
    const start = (query.page - 1) * query.pageSize;
    return NextResponse.json({
      items: matching.slice(start, start + query.pageSize).map(config.serialize),
      total: matching.length,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  const [items, total] = await Promise.all([
    config.delegate().findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    config.delegate().count({ where }),
  ]);
  return NextResponse.json({
    items: items.map(config.serialize),
    total,
    page: query.page,
    pageSize: query.pageSize,
  });
}

export async function createEntry(module: EntryModule, req: Request) {
  const config = MODULES[module];
  const user = await requireAuth();
  const body = config.createSchema.parse(await req.json()) as Record<
    string,
    unknown
  >;
  const record = await config.delegate().create({
    data: { ...config.toRecord(body), authorId: user.id },
  });
  return NextResponse.json(config.serialize(record), { status: 201 });
}

async function findScoped(
  module: EntryModule,
  id: string,
  user: SessionUser,
  action: "read" | "write",
): Promise<EntryRecord> {
  const record = await MODULES[module].delegate().findUnique({ where: { id } });
  if (!record) throw new HttpError("NOT_FOUND", "Not found");
  await requireOwnerOrScope(user, record.authorId, action);
  return record;
}

export async function getEntry(module: EntryModule, id: string) {
  const user = await requireAuth();
  const record = await findScoped(module, id, user, "read");
  return NextResponse.json(MODULES[module].serialize(record));
}

export async function patchEntry(module: EntryModule, id: string, req: Request) {
  const config = MODULES[module];
  const user = await requireAuth();
  await findScoped(module, id, user, "write");
  const body = config.patchSchema.parse(await req.json()) as Record<
    string,
    unknown
  >;
  const record = await config.delegate().update({
    where: { id },
    data: config.toRecord(body),
  });
  return NextResponse.json(config.serialize(record));
}

export async function deleteEntry(module: EntryModule, id: string) {
  const user = await requireAuth();
  await findScoped(module, id, user, "write");
  await MODULES[module].delegate().delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
