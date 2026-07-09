import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export function errorResponse(
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status: STATUS[code] },
  );
}

export function zodErrorResponse(err: ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return errorResponse("VALIDATION_ERROR", "Invalid request", fields);
}

export class HttpError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export function handleRouteError(err: unknown) {
  if (err instanceof ZodError) return zodErrorResponse(err);
  if (err instanceof HttpError) return errorResponse(err.code, err.message);
  console.error(err);
  return errorResponse("INTERNAL", "Something went wrong");
}
