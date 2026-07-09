import { z } from "zod";

export const ROLES = ["RECRUIT", "MANAGER", "ADMIN"] as const;
export const TASK_CATEGORIES = [
  "GENERAL",
  "TRAINING",
  "SETUP",
  "MEETING",
  "DOCUMENTATION",
  "OTHER",
] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const ISSUE_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const ISSUE_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
export const FEEDBACK_TYPES = ["POSITIVE", "SUGGESTION", "CONCERN"] as const;

export type Role = (typeof ROLES)[number];

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a digit");

export const nameSchema = z.string().trim().min(1, "Name is required").max(100);

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  })
  .strip();

export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    department: z.string().trim().max(100).nullable().optional(),
    startDate: dateOnlySchema.nullable().optional(),
  })
  .strip();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .strip();

// --- Entry modules (docs/API_SPEC.md "Entry resources") ---

const titleSchema = z.string().trim().min(1, "Title is required").max(200);
const longTextSchema = z.string().trim().max(5000);
const requiredLongTextSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(5000);

export const tagsSchema = z
  .array(z.string().trim().min(1, "Tags cannot be empty").max(30))
  .max(10, "At most 10 tags");

export const taskCreateSchema = z
  .object({
    date: dateOnlySchema,
    title: titleSchema,
    description: longTextSchema.nullable().optional(),
    category: z.enum(TASK_CATEGORIES),
    status: z.enum(TASK_STATUSES).default("TODO"),
    priority: z.enum(TASK_PRIORITIES).default("MEDIUM"),
  })
  .strip();

export const taskPatchSchema = z
  .object({
    date: dateOnlySchema.optional(),
    title: titleSchema.optional(),
    description: longTextSchema.nullable().optional(),
    category: z.enum(TASK_CATEGORIES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
  })
  .strip();

export const issueCreateSchema = z
  .object({
    date: dateOnlySchema,
    title: titleSchema,
    description: longTextSchema.nullable().optional(),
    severity: z.enum(ISSUE_SEVERITIES),
    status: z.enum(ISSUE_STATUSES).default("OPEN"),
    resolutionNotes: longTextSchema.nullable().optional(),
  })
  .strip();

export const issuePatchSchema = z
  .object({
    date: dateOnlySchema.optional(),
    title: titleSchema.optional(),
    description: longTextSchema.nullable().optional(),
    severity: z.enum(ISSUE_SEVERITIES).optional(),
    status: z.enum(ISSUE_STATUSES).optional(),
    resolutionNotes: longTextSchema.nullable().optional(),
  })
  .strip();

export const feedbackCreateSchema = z
  .object({
    date: dateOnlySchema,
    subject: titleSchema,
    type: z.enum(FEEDBACK_TYPES),
    details: requiredLongTextSchema,
  })
  .strip();

export const feedbackPatchSchema = z
  .object({
    date: dateOnlySchema.optional(),
    subject: titleSchema.optional(),
    type: z.enum(FEEDBACK_TYPES).optional(),
    details: requiredLongTextSchema.optional(),
  })
  .strip();

export const noteCreateSchema = z
  .object({
    date: dateOnlySchema,
    title: titleSchema,
    content: requiredLongTextSchema,
    tags: tagsSchema.default([]),
  })
  .strip();

export const notePatchSchema = z
  .object({
    date: dateOnlySchema.optional(),
    title: titleSchema.optional(),
    content: requiredLongTextSchema.optional(),
    tags: tagsSchema.optional(),
  })
  .strip();

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().optional(),
  from: dateOnlySchema.optional(),
  to: dateOnlySchema.optional(),
});
