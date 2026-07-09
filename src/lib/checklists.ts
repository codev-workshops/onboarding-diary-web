import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";
import { managerOversees, type SessionUser } from "@/lib/guards";

export type ChecklistTemplateItemDto = {
  id: string;
  text: string;
  order: number;
};

export type ChecklistTemplateDto = {
  id: string;
  title: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  items: ChecklistTemplateItemDto[];
  assignmentCount: number;
};

export type ChecklistAssignmentDto = {
  id: string;
  templateId: string;
  templateTitle: string;
  recruitId: string;
  recruitName: string;
  assignedById: string;
  createdAt: string;
  items: (ChecklistTemplateItemDto & {
    completed: boolean;
    completedAt: string | null;
  })[];
  completedCount: number;
  totalCount: number;
  progressPct: number;
};

function iso(d: Date): string {
  return d.toISOString();
}

export function progressPct(completed: number, total: number): number {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

type TemplateWithRelations = {
  id: string;
  title: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items: { id: string; text: string; order: number }[];
  _count: { assignments: number };
};

function serializeTemplate(t: TemplateWithRelations): ChecklistTemplateDto {
  return {
    id: t.id,
    title: t.title,
    createdById: t.createdById,
    createdAt: iso(t.createdAt),
    updatedAt: iso(t.updatedAt),
    items: [...t.items]
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ id: i.id, text: i.text, order: i.order })),
    assignmentCount: t._count.assignments,
  };
}

const templateInclude = {
  items: true,
  _count: { select: { assignments: true } },
} as const;

/** Admin/manager: list all templates with items. */
export async function listTemplates(): Promise<ChecklistTemplateDto[]> {
  const templates = await prisma.checklistTemplate.findMany({
    include: templateInclude,
    orderBy: { createdAt: "asc" },
  });
  return templates.map(serializeTemplate);
}

/** Admin/manager: create a template with ordered items. */
export async function createTemplate(
  user: SessionUser,
  data: { title: string; items: string[] },
): Promise<ChecklistTemplateDto> {
  const template = await prisma.checklistTemplate.create({
    data: {
      title: data.title,
      createdById: user.id,
      items: {
        create: data.items.map((text, idx) => ({ text, order: idx + 1 })),
      },
    },
    include: templateInclude,
  });
  return serializeTemplate(template);
}

export async function getTemplate(id: string): Promise<ChecklistTemplateDto> {
  const template = await prisma.checklistTemplate.findUnique({
    where: { id },
    include: templateInclude,
  });
  if (!template) throw new HttpError("NOT_FOUND", "Not found");
  return serializeTemplate(template);
}

/**
 * Admin/manager: update a template. Replacing `items` replaces the full
 * ordered list (and clears completions tied to removed items via cascade).
 */
export async function updateTemplate(
  id: string,
  data: { title?: string; items?: string[] },
): Promise<ChecklistTemplateDto> {
  const existing = await prisma.checklistTemplate.findUnique({ where: { id } });
  if (!existing) throw new HttpError("NOT_FOUND", "Not found");
  const template = await prisma.$transaction(async (tx) => {
    if (data.items) {
      await tx.checklistTemplateItem.deleteMany({ where: { templateId: id } });
      await tx.checklistTemplateItem.createMany({
        data: data.items.map((text, idx) => ({
          templateId: id,
          text,
          order: idx + 1,
        })),
      });
    }
    return tx.checklistTemplate.update({
      where: { id },
      data: { ...(data.title !== undefined ? { title: data.title } : {}) },
      include: templateInclude,
    });
  });
  return serializeTemplate(template);
}

export async function deleteTemplate(id: string): Promise<void> {
  const existing = await prisma.checklistTemplate.findUnique({ where: { id } });
  if (!existing) throw new HttpError("NOT_FOUND", "Not found");
  await prisma.checklistTemplate.delete({ where: { id } });
}

type AssignmentWithRelations = {
  id: string;
  templateId: string;
  recruitId: string;
  assignedById: string;
  createdAt: Date;
  template: {
    title: string;
    items: { id: string; text: string; order: number }[];
  };
  recruit: { name: string };
  completions: { itemId: string; completedAt: Date }[];
};

function serializeAssignment(
  a: AssignmentWithRelations,
): ChecklistAssignmentDto {
  const completedByItem = new Map(
    a.completions.map((c) => [c.itemId, c.completedAt]),
  );
  const items = [...a.template.items]
    .sort((x, y) => x.order - y.order)
    .map((i) => ({
      id: i.id,
      text: i.text,
      order: i.order,
      completed: completedByItem.has(i.id),
      completedAt: completedByItem.has(i.id)
        ? iso(completedByItem.get(i.id)!)
        : null,
    }));
  const completedCount = items.filter((i) => i.completed).length;
  return {
    id: a.id,
    templateId: a.templateId,
    templateTitle: a.template.title,
    recruitId: a.recruitId,
    recruitName: a.recruit.name,
    assignedById: a.assignedById,
    createdAt: iso(a.createdAt),
    items,
    completedCount,
    totalCount: items.length,
    progressPct: progressPct(completedCount, items.length),
  };
}

const assignmentInclude = {
  template: { select: { title: true, items: true } },
  recruit: { select: { name: true } },
  completions: { select: { itemId: true, completedAt: true } },
} as const;

/**
 * Scoped assignment listing: recruit sees own; manager sees assigned
 * recruits'; admin sees all.
 */
export async function listAssignments(
  user: SessionUser,
): Promise<ChecklistAssignmentDto[]> {
  let where: Record<string, unknown> = {};
  if (user.role === "RECRUIT") {
    where = { recruitId: user.id };
  } else if (user.role === "MANAGER") {
    const assignments = await prisma.managerAssignment.findMany({
      where: { managerId: user.id },
      select: { recruitId: true },
    });
    where = { recruitId: { in: assignments.map((a) => a.recruitId) } };
  }
  const rows = await prisma.checklistAssignment.findMany({
    where,
    include: assignmentInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(serializeAssignment);
}

/**
 * Manager (own recruits) / admin: assign a template to a recruit.
 * Duplicate template+recruit → 409.
 */
export async function createAssignment(
  user: SessionUser,
  data: { templateId: string; recruitId: string },
): Promise<ChecklistAssignmentDto> {
  const [template, recruit] = await Promise.all([
    prisma.checklistTemplate.findUnique({ where: { id: data.templateId } }),
    prisma.user.findUnique({ where: { id: data.recruitId } }),
  ]);
  if (!template) throw new HttpError("NOT_FOUND", "Template not found");
  if (!recruit || recruit.role !== "RECRUIT") {
    throw new HttpError("NOT_FOUND", "Recruit not found");
  }
  if (
    user.role === "MANAGER" &&
    !(await managerOversees(user.id, data.recruitId))
  ) {
    throw new HttpError("FORBIDDEN", "Recruit is not assigned to you");
  }
  const existing = await prisma.checklistAssignment.findUnique({
    where: {
      templateId_recruitId: {
        templateId: data.templateId,
        recruitId: data.recruitId,
      },
    },
  });
  if (existing) {
    throw new HttpError("CONFLICT", "Template already assigned to recruit");
  }
  const assignment = await prisma.checklistAssignment.create({
    data: {
      templateId: data.templateId,
      recruitId: data.recruitId,
      assignedById: user.id,
    },
    include: assignmentInclude,
  });
  return serializeAssignment(assignment);
}

async function getScopedAssignment(
  user: SessionUser,
  assignmentId: string,
): Promise<AssignmentWithRelations> {
  const assignment = await prisma.checklistAssignment.findUnique({
    where: { id: assignmentId },
    include: assignmentInclude,
  });
  if (!assignment) throw new HttpError("NOT_FOUND", "Not found");
  if (user.role === "RECRUIT" && assignment.recruitId !== user.id) {
    throw new HttpError("NOT_FOUND", "Not found");
  }
  if (
    user.role === "MANAGER" &&
    !(await managerOversees(user.id, assignment.recruitId))
  ) {
    throw new HttpError("NOT_FOUND", "Not found");
  }
  return assignment;
}

export async function getAssignment(
  user: SessionUser,
  assignmentId: string,
): Promise<ChecklistAssignmentDto> {
  return serializeAssignment(await getScopedAssignment(user, assignmentId));
}

/** Manager (own recruits) / admin: remove an assignment. */
export async function deleteAssignment(
  user: SessionUser,
  assignmentId: string,
): Promise<void> {
  const assignment = await getScopedAssignment(user, assignmentId);
  if (user.role === "RECRUIT") {
    throw new HttpError("FORBIDDEN", "Insufficient permissions");
  }
  await prisma.checklistAssignment.delete({ where: { id: assignment.id } });
}

/**
 * Recruit-only, own assignment: mark an item complete (PUT, idempotent) or
 * incomplete (DELETE). Managers/admins have read-only access → 403.
 */
export async function setItemCompletion(
  user: SessionUser,
  assignmentId: string,
  itemId: string,
  completed: boolean,
): Promise<ChecklistAssignmentDto> {
  const assignment = await getScopedAssignment(user, assignmentId);
  if (assignment.recruitId !== user.id) {
    throw new HttpError("FORBIDDEN", "Read-only access");
  }
  const item = assignment.template.items.find((i) => i.id === itemId);
  if (!item) throw new HttpError("NOT_FOUND", "Not found");
  if (completed) {
    await prisma.checklistItemCompletion.upsert({
      where: {
        assignmentId_itemId: { assignmentId: assignment.id, itemId },
      },
      create: { assignmentId: assignment.id, itemId },
      update: {},
    });
  } else {
    await prisma.checklistItemCompletion.deleteMany({
      where: { assignmentId: assignment.id, itemId },
    });
  }
  return getAssignment(user, assignment.id);
}

/** Per-recruit checklist progress for the manager dashboard. */
export async function checklistProgressByRecruit(
  recruitIds: string[],
): Promise<Map<string, { completed: number; total: number; pct: number }>> {
  if (recruitIds.length === 0) return new Map();
  const assignments = await prisma.checklistAssignment.findMany({
    where: { recruitId: { in: recruitIds } },
    include: {
      template: { select: { _count: { select: { items: true } } } },
      _count: { select: { completions: true } },
    },
  });
  const byRecruit = new Map<string, { completed: number; total: number }>();
  for (const a of assignments) {
    const entry = byRecruit.get(a.recruitId) ?? { completed: 0, total: 0 };
    entry.completed += a._count.completions;
    entry.total += a.template._count.items;
    byRecruit.set(a.recruitId, entry);
  }
  const result = new Map<
    string,
    { completed: number; total: number; pct: number }
  >();
  byRecruit.forEach(({ completed, total }, id) => {
    result.set(id, { completed, total, pct: progressPct(completed, total) });
  });
  return result;
}
