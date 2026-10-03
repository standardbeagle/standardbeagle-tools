import { describe, expect, test } from "bun:test";
import { newSubmissionId } from "../src/lib/submission-id";

describe("newSubmissionId", () => {
  test("needs no crypto.randomUUID, which an insecure (plain-http, non-localhost) page lacks", () => {
    const saved = (globalThis.crypto as any).randomUUID;
    (globalThis.crypto as any).randomUUID = undefined;
    try {
      expect(newSubmissionId()).toMatch(/^[0-9a-f]{32}$/);
    } finally {
      (globalThis.crypto as any).randomUUID = saved;
    }
  });

  test("renders the 16 bytes it is given as lowercase hex", () => {
    const id = newSubmissionId(bytes => { bytes.set([0, 1, 15, 16, 255]); return bytes; });
    expect(id.startsWith("00010f10ff")).toBe(true);
    expect(id).toHaveLength(32);
  });

  test("two submits get different keys, so the server's idempotency does not drop the second", () => {
    expect(newSubmissionId()).not.toBe(newSubmissionId());
  });
});
