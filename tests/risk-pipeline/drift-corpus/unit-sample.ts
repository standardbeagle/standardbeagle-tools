/**
 * Drift-test sample unit. Stable, production-shaped. Re-tagged 10x to measure
 * tagger output variance per axis.
 *
 * Expected axis values (for drift-contract reference):
 *   b=1  d=0  s=1  r=0  u=0   scalar=6
 *   conf_target: [0.80, 0.95]
 *
 * This docstring is intentionally normal (no @risk line) so each tagger run
 * must produce its own annotation independently. The expected values live in
 * drift-contract.md only — NOT pre-embedded here.
 */

import { createHash } from "crypto";

export interface SignedPayload {
  body: string;
  signature: string;
}

export function signPayload(body: string, secret: string): SignedPayload {
  const signature = createHash("sha256")
    .update(body + secret)
    .digest("hex");
  return { body, signature };
}

export function verifyPayload(p: SignedPayload, secret: string): boolean {
  const expected = createHash("sha256")
    .update(p.body + secret)
    .digest("hex");
  return expected === p.signature;
}

export function pairKey(id: string, nonce: string): string {
  if (!id || !nonce) throw new Error("id and nonce required");
  return `${id}:${nonce}`;
}
