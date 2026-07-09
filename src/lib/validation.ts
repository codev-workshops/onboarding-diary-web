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
