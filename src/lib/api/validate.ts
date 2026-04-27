import { z, ZodError, ZodSchema } from "zod";
import { errors } from "./response";

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: errors.validation("Invalid JSON body"),
    };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: errors.validation(zodIssues(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

export function parseQuery<T>(
  url: URL,
  schema: ZodSchema<T>,
): { ok: true; data: T } | { ok: false; response: Response } {
  const obj: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  const result = schema.safeParse(obj);
  if (!result.success) {
    return {
      ok: false,
      response: errors.validation(zodIssues(result.error)),
    };
  }
  return { ok: true, data: result.data };
}

export function zodIssues(err: ZodError) {
  return err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase, hyphenated, no spaces.",
  });

export const urlSchema = z
  .string()
  .url()
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).optional().default(25),
});
