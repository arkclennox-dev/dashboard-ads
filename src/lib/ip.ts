import { createHash } from "crypto";
import { env } from "./env";

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export function hashIp(ip: string): string {
  const secret = env.apiKeySecret || "dev-ip-salt";
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex").slice(0, 32);
}

const BOT_PATTERNS = [
  "bot",
  "crawler",
  "spider",
  "facebookexternalhit",
  "headlesschrome",
  "phantomjs",
  "slurp",
  "wget",
  "curl",
  "python-requests",
];

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((p) => ua.includes(p));
}

export function detectDeviceType(userAgent: string | null | undefined): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|android|ipod/.test(ua) && !/ipad|tablet/.test(ua)) return "mobile";
  if (/ipad|tablet/.test(ua)) return "tablet";
  return "desktop";
}
