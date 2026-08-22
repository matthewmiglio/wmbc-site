// Shared input validation for public API routes.
// ponytail: hand-rolled instead of zod — four fields, one regex, no new dependency.

/** Escapes text that gets interpolated into an HTML email body. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Returns a trimmed string, or null if the value is not a string or is longer
 * than `max`. Non-string bodies (objects, arrays) are rejected rather than
 * coerced, so they never reach the database.
 */
export function cleanStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > max ? null : t;
}

// ponytail: deliberately loose — the point is to reject junk and header/HTML
// payloads, not to prove an address is deliverable.
const EMAIL_RE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/;

export function isEmail(v: unknown): v is string {
  const s = cleanStr(v, 254);
  return s !== null && EMAIL_RE.test(s);
}
