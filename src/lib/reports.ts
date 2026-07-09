import { z } from "zod";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/errors";
import { managerOversees, type SessionUser } from "@/lib/guards";
import { dateOnlySchema } from "@/lib/validation";

export const REPORT_TYPES = ["tasks", "issues", "feedback"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

const MAX_RANGE_DAYS = 366;

export const reportQuerySchema = z
  .object({
    userId: z.string().optional(),
    from: dateOnlySchema,
    to: dateOnlySchema,
    types: z
      .string()
      .transform((raw) => {
        const parts = raw
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.includes("combined")) return [...REPORT_TYPES];
        return parts;
      })
      .pipe(z.array(z.enum(REPORT_TYPES)).min(1, "At least one type")),
    format: z.enum(["pdf", "csv"]),
  })
  .strip()
  .refine((q) => q.from <= q.to, {
    message: "from must be on or before to",
    path: ["from"],
  })
  .refine(
    (q) =>
      (new Date(`${q.to}T00:00:00.000Z`).getTime() -
        new Date(`${q.from}T00:00:00.000Z`).getTime()) /
        86400000 <=
      MAX_RANGE_DAYS,
    { message: `Range must span at most ${MAX_RANGE_DAYS} days`, path: ["to"] },
  );

export type ReportQuery = z.infer<typeof reportQuerySchema>;

/**
 * Resolve the user a report targets (docs/API_SPEC.md "Reports",
 * docs/REQUIREMENTS.md R3): recruit self only, manager self or assigned
 * recruit, admin any — out-of-scope → 403.
 */
export async function resolveReportUser(
  user: SessionUser,
  userId: string | undefined,
): Promise<{ id: string; name: string }> {
  const targetId = userId ?? user.id;
  if (targetId !== user.id) {
    if (user.role === "RECRUIT") {
      throw new HttpError("FORBIDDEN", "Insufficient permissions");
    }
    if (
      user.role === "MANAGER" &&
      !(await managerOversees(user.id, targetId))
    ) {
      throw new HttpError("FORBIDDEN", "Insufficient permissions");
    }
  }
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, name: true },
  });
  if (!target) throw new HttpError("NOT_FOUND", "Not found");
  return target;
}

type ReportSection = { type: ReportType; headers: string[]; rows: string[][] };

export type ReportData = {
  user: { id: string; name: string };
  from: string;
  to: string;
  sections: ReportSection[];
};

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Gather in-range entries of the requested types for the target user. */
export async function gatherReportData(
  target: { id: string; name: string },
  query: Pick<ReportQuery, "from" | "to" | "types">,
): Promise<ReportData> {
  const where = {
    authorId: target.id,
    date: {
      gte: new Date(`${query.from}T00:00:00.000Z`),
      lte: new Date(`${query.to}T00:00:00.000Z`),
    },
  };
  const orderBy = [{ date: "asc" as const }, { createdAt: "asc" as const }];

  const sections: ReportSection[] = [];
  for (const type of REPORT_TYPES) {
    if (!query.types.includes(type)) continue;
    if (type === "tasks") {
      const rows = await prisma.taskEntry.findMany({ where, orderBy });
      sections.push({
        type,
        headers: ["Date", "Title", "Category", "Status", "Priority", "Description"],
        rows: rows.map((r) => [
          dateOnly(r.date),
          r.title,
          r.category,
          r.status,
          r.priority,
          r.description ?? "",
        ]),
      });
    } else if (type === "issues") {
      const rows = await prisma.issueEntry.findMany({ where, orderBy });
      sections.push({
        type,
        headers: ["Date", "Title", "Severity", "Status", "Description", "Resolution notes"],
        rows: rows.map((r) => [
          dateOnly(r.date),
          r.title,
          r.severity,
          r.status,
          r.description ?? "",
          r.resolutionNotes ?? "",
        ]),
      });
    } else {
      const rows = await prisma.feedbackEntry.findMany({ where, orderBy });
      sections.push({
        type,
        headers: ["Date", "Subject", "Type", "Details"],
        rows: rows.map((r) => [dateOnly(r.date), r.subject, r.type, r.details]),
      });
    }
  }

  return { user: target, from: query.from, to: query.to, sections };
}

/**
 * RFC 4180 field escaping (quote when needed, double embedded quotes),
 * plus a leading apostrophe on formula-triggering characters so spreadsheet
 * apps treat user content as text (CSV/formula injection defense).
 */
export function csvEscape(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

export function reportToCsv(data: ReportData): string {
  const lines: string[] = [];
  for (const section of data.sections) {
    lines.push(csvEscape(section.type.toUpperCase()));
    lines.push(section.headers.map(csvEscape).join(","));
    for (const row of section.rows) {
      lines.push(row.map(csvEscape).join(","));
    }
    lines.push("");
  }
  return lines.join("\r\n");
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 14;

export async function reportToPdf(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const write = (text: string, size: number, useBold = false) => {
    if (y < MARGIN + LINE_HEIGHT) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    // Strip characters outside WinAnsi to keep encoding safe.
    const safe = text.replace(/[^\x20-\x7E]/g, "?");
    page.drawText(safe.slice(0, 120), {
      x: MARGIN,
      y,
      size,
      font: useBold ? bold : font,
    });
    y -= LINE_HEIGHT;
  };

  write(`Onboarding Diary report — ${data.user.name}`, 14, true);
  write(`Range: ${data.from} to ${data.to}`, 10);
  y -= LINE_HEIGHT / 2;

  for (const section of data.sections) {
    write(section.type.toUpperCase(), 12, true);
    write(section.headers.join(" | "), 9, true);
    if (section.rows.length === 0) {
      write("(no entries in range)", 9);
    }
    for (const row of section.rows) {
      write(row.join(" | "), 9);
    }
    y -= LINE_HEIGHT / 2;
  }

  return doc.save();
}

/** Filename slug: `report_<user>_<from>_<to>.<ext>` (docs/API_SPEC.md R2). */
export function reportFilename(
  userName: string,
  from: string,
  to: string,
  ext: "pdf" | "csv",
): string {
  const slug =
    userName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user";
  return `report_${slug}_${from}_${to}.${ext}`;
}
