import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, meta?: ApiSuccess<T>["meta"], status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data, meta }, { status });
}

export function created<T>(data: T) {
  return ok(data, undefined, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: unknown,
) {
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message, details } },
    { status },
  );
}

export const errors = {
  validation: (details: unknown) =>
    error("VALIDATION_ERROR", "Invalid request body", 422, details),
  badRequest: (message = "Bad request") => error("BAD_REQUEST", message, 400),
  unauthorized: (message = "Authentication required") =>
    error("UNAUTHORIZED", message, 401),
  forbidden: (message = "Insufficient scope") => error("FORBIDDEN", message, 403),
  notFound: (message = "Not found") => error("NOT_FOUND", message, 404),
  conflict: (message = "Conflict") => error("CONFLICT", message, 409),
  rateLimited: (message = "Too many requests") =>
    error("RATE_LIMITED", message, 429),
  server: (message = "Internal server error") =>
    error("INTERNAL_ERROR", message, 500),
  demoReadOnly: () =>
    error(
      "DEMO_READ_ONLY",
      "This deployment runs in demo mode. Configure Supabase to enable writes.",
      503,
    ),
};
