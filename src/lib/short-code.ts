import { randomBytes } from "crypto";

// Reserved top-level paths that short_codes cannot collide with.
// Keep in sync with src/app/**/{page,route}.tsx root-level directories.
export const RESERVED_PATHS = new Set([
  "admin",
  "api",
  "go",
  "rekomendasi",
  "disclaimer",
  "privacy-policy",
  "login",
  "logout",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "static",
  "public",
  "assets",
]);

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function generateShortCode(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidShortCode(code: string): boolean {
  if (!code) return false;
  if (code.length < 2 || code.length > 40) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) return false;
  if (RESERVED_PATHS.has(code.toLowerCase())) return false;
  return true;
}
