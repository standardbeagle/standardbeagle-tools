import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { runStart, stopRunning } from "../src/server";

async function withServer(fn: (url: string, dir: string) => Promise<void>) {
  const dir = mkdtempSync(join(tmpdir(), "comp-art-"));
  const ctl = await runStart({ command:"start", sessionDir:dir, docRoots:[], host:"127.0.0.1", port:0, urlHost:undefined, foreground:true, emitNavigate:false });
  try { await fn(ctl.url, dir); } finally { await stopRunning(ctl); rmSync(dir, { recursive: true, force: true }); }
}

const SCREEN = `---
kind: annotate-artifact
id: a1
title: Review the diff
status: pending
artifact:
  type: srcdoc
  inlineHtml: "<p id=x>hello</p>"
mode: annotate
layout_audit: true
actions:
  - {type: approve, label: Looks good}
  - {type: request-changes, label: Needs changes, requires_note: true}
---

## What to look at
`;

async function seed(url: string, dir: string) {
  writeFileSync(join(dir, "screens", "a1.md"), SCREEN);
  // wait for watcher to register the screen
  for (let i = 0; i < 40; i++) {
    const r = await (await fetch(`${url}/api/screens/a1`)).status;
    if (r === 200) return;
    await new Promise(res => setTimeout(res, 25));
  }
  throw new Error("screen a1 never registered");
}

test("annotate-artifact screen loads and lists with correct kind", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    const list = await (await fetch(`${url}/api/screens`)).json();
    const a = list.find((s: any) => s.id === "a1");
    expect(a.kind).toBe("annotate-artifact");
    const detail = await (await fetch(`${url}/api/screens/a1`)).json();
    expect(detail.frontmatter.mode).toBe("annotate");
    expect(detail.frontmatter.layout_audit).toBe(true);
  });
});

test("POST annotate records annotation to sidecar jsonl and event", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    const res = await fetch(`${url}/api/artifact/a1/annotate`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ anchor: "element", selector: "#x", tag: "p", text_excerpt: "hello", note: "typo here" }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).annotation_count).toBe(1);

    const side = join(dir, "screens", "a1.annotations.jsonl");
    expect(existsSync(side)).toBe(true);
    const ann = JSON.parse(readFileSync(side, "utf8").trim());
    expect(ann.selector).toBe("#x");
    expect(ann.note).toBe("typo here");

    const lines = readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
    const ev = lines.find(e => e.type === "artifact_annotation");
    expect(ev.anchor).toBe("element");
    expect(ev.note).toBe("typo here");
  });
});

test("annotate rejects missing note", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    const res = await fetch(`${url}/api/artifact/a1/annotate`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ anchor: "element", selector: "#x" }),
    });
    expect(res.status).toBe(400);
  });
});

test("approve flips status and appends artifact_approved", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    const res = await fetch(`${url}/api/artifact/a1/approve`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect(res.status).toBe(200);
    expect(readFileSync(join(dir, "screens", "a1.md"), "utf8")).toContain("status: approved");
    const lines = readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
    expect(lines.some(e => e.type === "artifact_approved" && e.screen_id === "a1")).toBe(true);
  });
});

test("request-changes flips status and carries annotation_count", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    await fetch(`${url}/api/artifact/a1/annotate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ anchor: "text", selector: "#x", text_excerpt: "hello", note: "n1" }) });
    await fetch(`${url}/api/artifact/a1/annotate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ anchor: "element", selector: "#x", note: "n2" }) });
    const res = await fetch(`${url}/api/artifact/a1/request-changes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ note: "please fix" }) });
    expect(res.status).toBe(200);
    expect((await res.json()).annotation_count).toBe(2);
    expect(readFileSync(join(dir, "screens", "a1.md"), "utf8")).toContain("status: changes-requested");
    const lines = readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
    const ev = lines.find(e => e.type === "artifact_changes_requested");
    expect(ev.annotation_count).toBe(2);
    expect(ev.note).toBe("please fix");
  });
});

test("layout fix-first / override append layout_findings with resolution", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    const findings = [{ selector: "#x", kind: "element-scroll-overflow", overflowPx: 12 }];
    const res = await fetch(`${url}/api/layout/a1/fix-first`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ findings }) });
    expect(res.status).toBe(200);
    expect((await res.json()).resolution).toBe("fix-first");
    const lines = readFileSync(join(dir, "events.jsonl"), "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
    const ev = lines.find(e => e.type === "layout_findings");
    expect(ev.resolution).toBe("fix-first");
    expect(ev.findings[0].selector).toBe("#x");
  });
});

test("artifact endpoints 400/404 on non-artifact or unknown screen", async () => {
  await withServer(async (url, dir) => {
    await seed(url, dir);
    const annotate = await fetch(`${url}/api/artifact/nope/annotate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ anchor: "element", selector: "#x", note: "n" }) });
    expect(annotate.status).toBe(400);
    const layout = await fetch(`${url}/api/layout/nope/override`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect(layout.status).toBe(404);
  });
});
