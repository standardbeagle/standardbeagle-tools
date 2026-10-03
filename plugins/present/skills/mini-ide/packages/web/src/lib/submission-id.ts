// A per-submit idempotency key for /api/answer.
//
// Not crypto.randomUUID(): browsers expose it only in a secure context (HTTPS or
// localhost), and the companion is also served over plain http on a tailnet or LAN
// address (`--host`). There randomUUID is undefined, the submit threw before its
// fetch, and every answer was silently lost. getRandomValues has no such gate.
export function newSubmissionId(
  fill: (bytes: Uint8Array) => Uint8Array = bytes => globalThis.crypto.getRandomValues(bytes),
): string {
  const bytes = fill(new Uint8Array(16));
  let id = "";
  for (const b of bytes) id += b.toString(16).padStart(2, "0");
  return id;
}
