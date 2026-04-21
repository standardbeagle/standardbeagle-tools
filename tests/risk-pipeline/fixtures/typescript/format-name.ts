/**
 * Format a display name: "First Last" → "Last, First".
 * Pure string transform. No I/O, no state, no external deps.
 *
 * @risk b.d.s.r.u. tagged:2026-04-21 model:haiku conf:0.95
 */
export function formatName(first: string, last: string): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  if (!f && !l) return "";
  if (!l) return f;
  if (!f) return l;
  return `${l}, ${f}`;
}
