---
name: present-html-report
description: "Generate a self-contained Tailwind+Mermaid HTML report from structured data, write to OS temp dir, open in browser. Reusable presenter for audits/reviews/reports. Use when: present an HTML report, render audit/review results, show a dashboard, visualize findings, before hand-rolling report HTML"
disable-model-invocation: true
---

# Present: HTML Report

Render structured findings as a single self-contained HTML file and open it in the browser. The canonical home for the report scaffold many skills used to re-describe inline — call this instead of hand-writing report HTML.

## Input

The caller supplies: a **title**, an ordered list of **sections** (heading + HTML/markdown body), optional **diagrams** (Mermaid graph/flow/sequence source), and optional per-item **badges** (e.g. severity, recommendation strength).

## Output

1. Resolve the OS temp dir: `$TMPDIR` → `/tmp` (`%TEMP%` on Windows).
2. Write `<tmpdir>/<slug>-<timestamp>.html` — **never** the repo.
3. Open it: `xdg-open` (Linux) / `open` (macOS) / `start` (Windows). If the agnt plugin is running a proxy, serving through it is also fine.
4. Print the absolute path.

## Scaffold

Self-contained: **Tailwind via CDN** for layout, **Mermaid via CDN** for graph-shaped diagrams; hand-built divs/SVG for editorial visuals. No build step, no repo artifacts. Full scaffold + diagram patterns + styling: [HTML-REPORT.md](HTML-REPORT.md).

> Scaffold adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), `skills/engineering/improve-codebase-architecture/HTML-REPORT.md`.

## Related

- `present:doc` — 欲重開或重渲此技藝已產之 `.html`（無需重生資料）→ 以其絕對路徑呼 `present:doc`。本技藝生成報告，`present:doc` 專司開啟既存 `.md`/`.html`。
