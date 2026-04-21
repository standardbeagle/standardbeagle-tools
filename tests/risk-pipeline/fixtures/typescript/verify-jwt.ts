import { createHmac, timingSafeEqual } from "crypto";

export interface Claims {
  sub: string;
  exp: number;
  iat: number;
}

/**
 * Verify JWT HMAC-SHA256 signature, decode payload. Throws on invalid.
 *
 * @risk b+d.s!r-u. tagged:2026-04-21 model:haiku conf:0.90
 * @risk-why "Signature bypass = auth bypass. Broad blast via callers."
 */
export function verifyJWT(token: string, secret: string): Claims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");
  const [header, payload, signature] = parts;

  const expected = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) throw new Error("Invalid signature");
  if (!timingSafeEqual(sigBuf, expBuf)) throw new Error("Invalid signature");

  const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as Claims;
  if (claims.exp < Date.now() / 1000) throw new Error("Expired");
  return claims;
}
