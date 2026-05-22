# Matt Pocock Skills Incorporation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thread selected mattpocock/skills (MIT) into the dartai planning/execution/review loop by adding 6 new and enhancing 5 existing `dev-standards` skills (plus a glossary+ADR substrate navigated via LCI), and extract reusable browser-presentation primitives into a new `present` plugin those skills consume.

**Architecture:** Two phases. **Phase A** builds a standalone `present` plugin (`present:html-report`, `present:doc`) — reusable UI primitives any plugin invokes by name across the cache boundary. **Phase B** adds/enhances `dev-standards` skills so dartai (which already delegates to dev-standards) auto-inherits; a domain glossary (`.claude/rules/glossary.md`) + one-line ADR index (`.claude/rules/architecture.md`) with promotion to full `docs/adr/NNNN-*.md` forms a shared substrate every phase reads; LCI is woven at every explore seam ("prefer LCI; fall back to Grep/Read"). Presentation tasks (handoff, prototype NOTES, the architecture report) consume the Phase-A primitives with a print-the-path fallback. The interactive companion (3rd primitive) is deferred to Dart task `db3R4BBmlndp`.

**Tech Stack:** Markdown SKILL.md files (Claude Code plugin skills), bash hook script, `claude plugin validate`, headless `tests/run-start-tests.sh` harness, dart-query MCP (to-issues), lci plugin skills.

**Source:** https://github.com/mattpocock/skills (MIT, Matt Pocock 2026). Spec: `docs/superpowers/specs/2026-05-21-matt-pocock-skills-incorporation-design.md`.

**Verification model (no unit tests for markdown skills):** each skill task verifies with (a) `claude plugin validate ./plugins/dev-standards`, (b) a description-budget check (≤1024 chars, target 150–400), (c) a frontmatter sanity grep. Final task runs the headless probe + full marketplace validate.

**Conventions for every new SKILL.md:**
- Frontmatter: `name` (prefix `dev-standards-` to match existing folder→name pattern), `description`, `disable-model-invocation: true` UNLESS the skill must auto-trigger (dev-standards is auto-invocable tier — keep new skills `disable-model-invocation: true` except `diagnose` and `grill-task` which benefit from auto-trigger; see each task).
- NO `allowed-tools` (repo rule).
- Soft guidance ("prefer", "default toward"), escape valves.
- Attribution line at the bottom: `> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: \`<path>\`.`
- LCI seam prefix where the skill explores: `> Prefer LCI (\`lci:search\`, \`lci:explore\`, \`lci:trace-symbol\`) for codebase navigation; fall back to Grep/Read if the lci plugin is unavailable.`

---

## Task 0: Fetch Matt's supporting files to a scratch dir

**Files:**
- Create: `/tmp/mp-skills/` (scratch, not committed)

- [ ] **Step 1: Fetch the bundled reference files**

Run:
```bash
mkdir -p /tmp/mp-skills
base="https://raw.githubusercontent.com/mattpocock/skills/main/skills"
for f in \
  "engineering/prototype/LOGIC.md" \
  "engineering/prototype/UI.md" \
  "engineering/improve-codebase-architecture/LANGUAGE.md" \
  "engineering/improve-codebase-architecture/HTML-REPORT.md" \
  "engineering/improve-codebase-architecture/INTERFACE-DESIGN.md" \
  "engineering/grill-with-docs/CONTEXT-FORMAT.md" \
  "engineering/grill-with-docs/ADR-FORMAT.md" \
  "misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh" \
  ; do
    out="/tmp/mp-skills/$(echo "$f" | tr '/' '_')"
    curl -sfL "$base/$f" -o "$out" && echo "OK  $out" || echo "MISS $f"
done
ls -la /tmp/mp-skills/
```
Expected: 8 `OK` lines. If any `MISS`, the path moved — open https://github.com/mattpocock/skills and locate the file before continuing.

- [ ] **Step 2: No commit** (scratch files only). Proceed.

---

# Phase A — Shared `present` plugin (build first; Phase B consumes it)

## Task A1: Scaffold `present` plugin + `html-report` skill

**Files:**
- Create: `plugins/present/.claude-plugin/plugin.json`
- Create: `plugins/present/skills/html-report/SKILL.md`
- Create: `plugins/present/skills/html-report/HTML-REPORT.md` (scaffold ref, from `/tmp/mp-skills/engineering_improve-codebase-architecture_HTML-REPORT.md`)
- Modify: `.claude-plugin/marketplace.json` (add `present` entry)

- [ ] **Step 1: Write `plugin.json`**

```json
{
  "name": "present",
  "version": "0.1.0",
  "description": "Reusable browser presentation primitives: self-contained HTML reports and markdown/doc viewing. Shared UI layer consumed by other plugins.",
  "author": { "name": "Standard Beagle", "url": "https://github.com/standardbeagle" },
  "homepage": "https://github.com/standardbeagle/standardbeagle-tools",
  "repository": "https://github.com/standardbeagle/standardbeagle-tools",
  "license": "MIT",
  "keywords": ["html-report", "presentation", "browser", "markdown", "reusable-ui", "tailwind", "mermaid"]
}
```

- [ ] **Step 2: Write `HTML-REPORT.md`**

Copy `/tmp/mp-skills/engineering_improve-codebase-architecture_HTML-REPORT.md` verbatim. Apply one generalization edit: where the text is specific to "architecture review" candidates, keep the patterns but note they are examples of a general report (title + sections + Mermaid diagrams + badges). Do not remove the diagram/styling guidance.

- [ ] **Step 3: Write `SKILL.md`**

```markdown
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
```

- [ ] **Step 4: Add the marketplace entry**

In `.claude-plugin/marketplace.json`, add a new object to the `plugins` array (place it after the `dev-standards` entry):

```json
    {
      "name": "present",
      "source": "./plugins/present",
      "version": "0.1.0",
      "description": "Reusable browser presentation primitives: self-contained HTML reports and markdown/doc viewing. Shared UI layer consumed by other plugins."
    },
```

(The catalog `version` bump to `1.9.0` happens in Task 13. Match the surrounding entries' field shape — copy a sibling entry and edit, so any required fields like `category`/`keywords` present on siblings are included.)

- [ ] **Step 5: Validate + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/present
claude plugin validate .
git add plugins/present/skills/html-report/ plugins/present/.claude-plugin/ .claude-plugin/marketplace.json
git commit -m "feat(present): new plugin with html-report presentation primitive"
```
Expected: both validations pass.

---

## Task A2: `present:doc` skill (markdown/HTML viewer)

**Files:**
- Create: `plugins/present/skills/doc/SKILL.md`
- Create: `plugins/present/skills/doc/scripts/md-to-html.sh`

- [ ] **Step 1: Write `scripts/md-to-html.sh`**

```bash
#!/usr/bin/env bash
# Render a markdown file to a self-contained HTML viewer using marked (CDN).
# Usage: md-to-html.sh <path-to.md> [output.html]   (prints the output path)
set -euo pipefail
src="${1:?usage: md-to-html.sh <file.md> [out.html]}"
out="${2:-${src%.md}.view.html}"
title="$(basename "$src")"
{
  cat <<'HTML_HEAD'
<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>body{max-width:50rem;margin:2rem auto;padding:0 1rem;font:16px/1.6 system-ui,sans-serif;color:#1a1a1a}pre{background:#f4f4f4;padding:1rem;overflow:auto;border-radius:6px}code{font-family:ui-monospace,monospace}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.4rem .6rem}</style>
</head><body><div id="content"></div>
<script id="src" type="text/markdown">
HTML_HEAD
  cat "$src"
  cat <<'HTML_TAIL'
</script>
<script>document.getElementById('content').innerHTML=marked.parse(document.getElementById('src').textContent);</script>
</body></html>
HTML_TAIL
} > "$out"
sed -i.bak "s/__TITLE__/$title/" "$out" 2>/dev/null || sed -i '' "s/__TITLE__/$title/" "$out"
rm -f "$out.bak"
echo "$out"
```

Then: `chmod +x plugins/present/skills/doc/scripts/md-to-html.sh`.

- [ ] **Step 2: Write `SKILL.md`**

```markdown
---
name: present-doc
description: "Open a markdown or HTML file in the browser (renders .md → HTML via CDN marked). Reusable doc presenter. Use when: show a markdown file, open a doc in browser, present handoff/notes/report doc to the user, view .md rendered"
disable-model-invocation: true
---

# Present: Doc

Open a given document in the browser. Markdown is rendered client-side (no local parser dependency); HTML is passed through.

## Process

1. Input: an absolute path to a `.md` or `.html` file.
2. If `.html`: open it directly (Step 4).
3. If `.md`: run `scripts/md-to-html.sh <md-path>` to produce a self-contained `<file>.view.html` (marked from CDN + minimal styling). If the source dir is read-only, pass an output path in the OS temp dir as the second arg.
4. Open: `xdg-open` (Linux) / `open` (macOS) / `start` (Windows). If agnt's proxy is running, serving through it is also fine.
5. Print the absolute path of what was opened.

## Fallback

If no browser-open command is available (headless CI, no display), print the absolute source path and a one-line note — do not fail the calling skill.
```

- [ ] **Step 3: Verify the render script**

```bash
cd /home/beagle/work/standardbeagle-tools
printf '# Hello\n\n- a\n- b\n' > /tmp/present-test.md
bash plugins/present/skills/doc/scripts/md-to-html.sh /tmp/present-test.md
grep -q "marked.parse" /tmp/present-test.view.html && grep -q "present-test.md" /tmp/present-test.view.html && echo OK
```
Expected: prints the `.view.html` path then `OK`.

- [ ] **Step 4: Validate + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/present
git add plugins/present/skills/doc/
git commit -m "feat(present): add doc skill (markdown/HTML browser viewer)"
```

---

# Phase B — Matt Pocock skills + glossary/ADR substrate

## Task 1: New skill `glossary` (substrate manager)

Manages `.claude/rules/glossary.md` the way `decide` manages architecture.md. Built first because grill-task, diagnose, refactor-first-assessment, to-issues all read the glossary.

**Files:**
- Create: `plugins/dev-standards/skills/glossary/SKILL.md`
- Create: `plugins/dev-standards/skills/glossary/CONTEXT-FORMAT.md` (adapted from `/tmp/mp-skills/engineering_grill-with-docs_CONTEXT-FORMAT.md`)

- [ ] **Step 1: Write `CONTEXT-FORMAT.md`**

Copy `/tmp/mp-skills/engineering_grill-with-docs_CONTEXT-FORMAT.md` verbatim into the new file, then apply these edits:
- Replace every reference to `CONTEXT.md` with `.claude/rules/glossary.md`.
- Keep the term-entry format (term, definition, "not to be confused with", related terms) exactly.
- Remove any reference to `CONTEXT-MAP.md` / multi-context repos (out of scope — single glossary).

- [ ] **Step 2: Write `SKILL.md`**

```markdown
---
name: dev-standards-glossary
description: "Manage `.claude/rules/glossary.md` domain vocabulary (ubiquitous language). 管理項目領域詞彙表。 Use when: define term, add glossary entry, list glossary, sharpen fuzzy term, resolve naming conflict, check vocab vs code"
disable-model-invocation: true
---

# Glossary

管理 `.claude/rules/glossary.md` 中項目領域詞彙（ubiquitous language）。詞彙表為純詞彙——絕無實現細節。每個 dartai 階段讀此表以統一語言。

> Prefer LCI (`lci:search`) to check whether a term matches how code actually names things; fall back to Grep/Read if the lci plugin is unavailable.

## Step 1 — Check for glossary.md

讀 `.claude/rules/glossary.md`。若不存在，可直接創建（與 `decide` 不同，glossary 可惰性創建）。首個術語解析時建文件。

## Step 2 — List / parse current terms

讀文件，呈現現有術語：term + 一行定義。空則報 `(none)`。

## Step 3 — Add or sharpen a term

For each term:
- **Definition** — one precise sentence, domain-level, no implementation detail.
- **Not to be confused with** — adjacent terms it is often conflated with.
- **Related** — links to other glossary terms.

衝突檢測：新術語與現有定義矛盾，立即標出，問用戶取捨——勿靜默覆蓋。

模糊術語：用戶用 overloaded 詞（如 "account" 指 Customer 抑或 User），提出精確 canonical 名。

代碼交叉核對：`lci:search <term>` 看代碼如何命名。代碼與擬定義不符則浮出矛盾。

Format per [CONTEXT-FORMAT.md](CONTEXT-FORMAT.md).

## Step 4 — Write

Update `.claude/rules/glossary.md` in place. 勿批處理——術語解析即寫。

`glossary.md` 絕不可成為 spec、scratch pad 或實現決策倉。它只是詞彙表。架構決策歸 [[decide]]（architecture.md / docs/adr/）。

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/engineering/grill-with-docs` (CONTEXT.md management half).
```

- [ ] **Step 3: Validate + budget check**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
awk -F'description: ' '/^description:/{print length($2)}' plugins/dev-standards/skills/glossary/SKILL.md
```
Expected: validate passes; description length printed is < 1024 (target 150–400).

- [ ] **Step 4: Commit**

```bash
git add plugins/dev-standards/skills/glossary/
git commit -m "feat(dev-standards): add glossary skill for domain vocabulary substrate"
```

---

## Task 2: Enhance `setup-project` — generate glossary stub + ADR promotion convention

**Files:**
- Modify: `plugins/dev-standards/skills/setup-project/SKILL.md`

- [ ] **Step 1: Read the current skill**

Run: `cat plugins/dev-standards/skills/setup-project/SKILL.md`
Locate the section that generates `.claude/rules/*.md` files (architecture.md generation).

- [ ] **Step 2: Add glossary.md stub generation**

In the rule-file generation section, after architecture.md is generated, add an instruction block (match the file's existing language style — wenyan if the file is wenyan):

> 同時生成 `.claude/rules/glossary.md` 存根：標題 `# Domain Glossary` + 一行說明「純領域詞彙，無實現細節；由 [[grill-task]] / [[glossary]] 增量維護」+ 空 `## Terms` 節。
>
> 在生成之 architecture.md 中，於 ADR 約定處註明：一行 `DECISION:` 為索引；通過三重測試（難以逆轉 + 無上下文則意外 + 真實權衡）者，由 [[decide]] 提升為完整 `docs/adr/NNNN-*.md`。

- [ ] **Step 3: Validate**

Run: `claude plugin validate ./plugins/dev-standards`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add plugins/dev-standards/skills/setup-project/SKILL.md
git commit -m "feat(dev-standards): setup-project generates glossary.md stub + ADR promotion note"
```

---

## Task 3: Enhance `decide` — ADR promotion to docs/adr/

**Files:**
- Modify: `plugins/dev-standards/skills/decide/SKILL.md`
- Create: `plugins/dev-standards/skills/decide/ADR-FORMAT.md` (adapted from `/tmp/mp-skills/engineering_grill-with-docs_ADR-FORMAT.md`)

- [ ] **Step 1: Write `ADR-FORMAT.md`**

Copy `/tmp/mp-skills/engineering_grill-with-docs_ADR-FORMAT.md` verbatim, then:
- Confirm the file name convention is `docs/adr/NNNN-kebab-title.md` (4-digit zero-padded sequence). If Matt's file uses a different scheme, normalize to `NNNN-kebab-title.md`.
- Keep the ADR sections (Context, Decision, Consequences, Alternatives considered, Status).

- [ ] **Step 2: Read current `decide` SKILL.md**

Run: `cat plugins/dev-standards/skills/decide/SKILL.md`
Note the step that records a new `DECISION:` line in architecture.md.

- [ ] **Step 3: Add the promotion step**

After the step that writes the one-line `DECISION:` entry, insert a new step (match file language style):

> ## Step N — Offer ADR promotion (三重測試)
>
> 記錄 `DECISION:` 一行後，評估是否提升為完整 ADR。三條件**全部**成立才提升：
> 1. **難以逆轉** — 日後改變成本顯著
> 2. **無上下文則意外** — 未來讀者會問「為何如此？」
> 3. **真實權衡之果** — 確有替代方案，因具體理由擇一
>
> 任一不足則跳過，只留一行索引。三者皆備則：
> - 寫 `docs/adr/NNNN-<kebab-title>.md`（序號取現有最大值 +1），格式見 [ADR-FORMAT.md](ADR-FORMAT.md)。
> - architecture.md 之 `DECISION:` 行末附 `(ADR-NNNN)` 引用。
>
> `docs/adr/` 不存在則於首個 ADR 提升時惰性創建。

- [ ] **Step 4: Validate + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
git add plugins/dev-standards/skills/decide/
git commit -m "feat(dev-standards): decide promotes load-bearing decisions to docs/adr/ ADR files"
```

---

## Task 4: Enhance `grill-task` — glossary/ADR construction engine

This is the grill-with-docs discipline grafted onto the existing intake-grilling skill.

**Files:**
- Modify: `plugins/dev-standards/skills/grill-task/SKILL.md`

- [ ] **Step 1: Read current `grill-task` SKILL.md**

Run: `cat plugins/dev-standards/skills/grill-task/SKILL.md`
Identify the codebase-exploration step and the question-loop section.

- [ ] **Step 2: Add LCI seam prefix near exploration**

Insert at the top of the exploration guidance:

> Prefer LCI (`lci:search` for symbols/terms, `lci:explore` for module maps) over Grep when exploring; fall back to Grep/Read if the lci plugin is unavailable. If a question can be answered by exploring the codebase, explore instead of asking.

- [ ] **Step 3: Add a "Domain discipline" section**

Append this section (match the file's language style):

> ## Domain discipline (build the glossary as you grill)
>
> While grilling, maintain `.claude/rules/glossary.md` inline:
> - **Challenge against the glossary.** User term conflicts with an existing definition → call it out immediately, ask which meaning holds.
> - **Sharpen fuzzy language.** Vague/overloaded term → propose a precise canonical name ("'account' — Customer or User?").
> - **Concrete scenarios.** Stress-test domain relationships with specific edge-case scenarios.
> - **Cross-reference code.** `lci:search <term>` — if code contradicts what the user said, surface it.
> - **Update glossary.md inline** as each term resolves (don't batch). Format + mechanics: see [[glossary]] and `skills/glossary/CONTEXT-FORMAT.md`.
> - **Offer ADRs sparingly.** Only when hard-to-reverse + surprising-without-context + real-tradeoff. Route through [[decide]] (which handles the one-line index + `docs/adr/` promotion).

- [ ] **Step 4: Validate + budget**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
awk -F'description: ' '/^description:/{print length($2)}' plugins/dev-standards/skills/grill-task/SKILL.md
```
Expected: passes; description still < 1024 (description may be unchanged — that's fine).

- [ ] **Step 5: Commit**

```bash
git add plugins/dev-standards/skills/grill-task/SKILL.md
git commit -m "feat(dev-standards): grill-task builds glossary + offers ADRs during intake grilling"
```

---

## Task 5: Enhance `refactor-first-assessment` — deepening lens

Grafts improve-codebase-architecture's deep-module analysis onto the planning refactor-assessment skill.

**Files:**
- Modify: `plugins/dev-standards/skills/refactor-first-assessment/SKILL.md`
- Create: `plugins/dev-standards/skills/refactor-first-assessment/LANGUAGE.md` (from `/tmp/mp-skills/engineering_improve-codebase-architecture_LANGUAGE.md`)
- Create: `plugins/dev-standards/skills/refactor-first-assessment/INTERFACE-DESIGN.md` (from `/tmp/mp-skills/engineering_improve-codebase-architecture_INTERFACE-DESIGN.md`)

(Note: `HTML-REPORT.md` is NOT created here — the report scaffold lives in `present:html-report` from Phase A; this skill delegates to it.)

- [ ] **Step 1: Copy the two reference files verbatim**

Copy `/tmp/mp-skills/engineering_improve-codebase-architecture_LANGUAGE.md` and `..._INTERFACE-DESIGN.md` into the matching new files. Apply one edit across both: any reference to a sibling file `../grill-with-docs/CONTEXT-FORMAT.md` or `../grill-with-docs/ADR-FORMAT.md` → repoint to `[[glossary]]` (CONTEXT-FORMAT.md) and `[[decide]]` (ADR-FORMAT.md) respectively. Any reference to `CONTEXT.md` → `.claude/rules/glossary.md`. Any reference to an inline HTML report → `present:html-report`.

- [ ] **Step 2: Read current skill**

Run: `cat plugins/dev-standards/skills/refactor-first-assessment/SKILL.md`
Find the assessment/analysis section.

- [ ] **Step 3: Add the deepening-lens section**

Append (match file language style):

> ## Deepening lens (deep vs shallow modules)
>
> When assessing whether a refactor is warranted, use this vocabulary consistently (full definitions in [LANGUAGE.md](LANGUAGE.md)):
> - **Module** — anything with an interface + implementation. **Interface** — everything a caller must know. **Depth** — leverage behind a small interface (deep = high leverage; shallow = interface nearly as complex as impl). **Seam** — where behaviour can be altered without editing in place. **Locality** / **Leverage** — what maintainers / callers get from depth.
> - **Deletion test:** imagine deleting the module. Complexity vanishes → it was a pass-through (shallow). Complexity reappears across N callers → it earned its keep (deep).
> - **The interface is the test surface.** One adapter = hypothetical seam; two adapters = real seam.
>
> Explore with `lci:explore` (module map) + `lci:trace-symbol` (find all callers for the deletion test); fall back to the `Explore` agent or Grep if lci is unavailable.
>
> **HTML report → delegate to `present:html-report`.** For a multi-candidate architecture review, do NOT inline an HTML scaffold here. Assemble the structured data (title; per-candidate before/after sections; recommendation-strength badge: Strong / Worth exploring / Speculative; optional Mermaid before/after diagrams) and invoke `present:html-report`, which writes the self-contained Tailwind+Mermaid HTML to the OS temp dir and opens it. If the `present` plugin is unavailable, fall back to writing a plain summary to the temp dir and printing the path. Interface-design exploration: [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md).
>
> Use `.claude/rules/glossary.md` vocab for the domain, LANGUAGE.md vocab for the architecture. Respect ADRs in `.claude/rules/architecture.md` + `docs/adr/`; flag (don't silently re-litigate) candidates that contradict an existing ADR.

- [ ] **Step 4: Validate + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
git add plugins/dev-standards/skills/refactor-first-assessment/
git commit -m "feat(dev-standards): refactor-first-assessment gains deep-module deepening lens (delegates report to present:html-report)"
```

---

## Task 6: New skill `diagnose`

Feedback-loop-first debugging discipline. Auto-invocable (debugging is a frequent trigger).

**Files:**
- Create: `plugins/dev-standards/skills/diagnose/SKILL.md`

- [ ] **Step 1: Port the diagnose body**

Use the verbatim body of Matt's `engineering/diagnose/SKILL.md` (full text is reproduced in the design-spec research; or re-fetch `https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/diagnose/SKILL.md`). Keep all 6 phases (Build a feedback loop / Reproduce / Hypothesise / Instrument / Fix+regression-test / Cleanup+post-mortem) verbatim. Then apply these exact edits:

1. Replace the frontmatter with:
```yaml
---
name: dev-standards-diagnose
description: "Feedback-loop-first debug discipline for hard bugs + perf regressions: reproduce→minimise→hypothesise→instrument→fix→regression-test. Use when: diagnose this, debug this, bug, broken, throwing, failing, perf regression, flaky test"
---
```
(No `disable-model-invocation` — leave auto-invocable.)

2. In the codebase-exploration sentence ("use the project's domain glossary…"), repoint to `.claude/rules/glossary.md` and add: "Prefer `lci:trace-symbol <fn>` to map the bug's call path (callers + side effects) and `lci:search` to locate the seam; fall back to Grep/Read if the lci plugin is unavailable."

3. In Phase 6, change the hand-off target from `/improve-codebase-architecture` to: "hand off to [[refactor-first-assessment]] (deepening lens) with the specifics — make the recommendation after the fix is in."

4. Append the attribution line:
```markdown
> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/engineering/diagnose`.
```

- [ ] **Step 2: Validate + budget**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
awk -F'description: ' '/^description:/{print length($2)}' plugins/dev-standards/skills/diagnose/SKILL.md
```
Expected: passes; description < 1024.

- [ ] **Step 3: Commit**

```bash
git add plugins/dev-standards/skills/diagnose/
git commit -m "feat(dev-standards): add diagnose feedback-loop debugging skill with LCI bug-path tracing"
```

---

## Task 7: New skill `prototype`

**Files:**
- Create: `plugins/dev-standards/skills/prototype/SKILL.md`
- Create: `plugins/dev-standards/skills/prototype/LOGIC.md` (from `/tmp/mp-skills/engineering_prototype_LOGIC.md`)
- Create: `plugins/dev-standards/skills/prototype/UI.md` (from `/tmp/mp-skills/engineering_prototype_UI.md`)

- [ ] **Step 1: Copy LOGIC.md + UI.md verbatim** (no edits needed — they are runner-agnostic).

- [ ] **Step 2: Port the prototype SKILL.md body**

Use Matt's `engineering/prototype/SKILL.md` body verbatim (the "Pick a branch" + "Rules that apply to both" + "When done" sections). Then:

1. Replace frontmatter:
```yaml
---
name: dev-standards-prototype
description: "Build throwaway prototype to de-risk a design before committing. Branches: terminal app for state/logic, or multi-variant UI route. Use when: prototype this, sanity-check data model/state machine, mock up UI, explore design options, let me play with it, try a few designs"
disable-model-invocation: true
---
```

2. In "When done", change the capture targets to: "Capture the *answer* (and the question it answered) somewhere durable — a `.claude/rules/glossary.md` term, an ADR via [[decide]], a Dart task, or a `NOTES.md` next to the prototype — then delete or absorb the prototype. If a `NOTES.md` is written and the user is around, present it via `present:doc` (browser); fall back to printing the path."

3. Append attribution line (original: `skills/engineering/prototype`).

- [ ] **Step 3: Validate + budget + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
awk -F'description: ' '/^description:/{print length($2)}' plugins/dev-standards/skills/prototype/SKILL.md
git add plugins/dev-standards/skills/prototype/
git commit -m "feat(dev-standards): add prototype skill (logic/UI throwaway branches) for plan de-risking"
```

---

## Task 8: New skill `handoff`

**Files:**
- Create: `plugins/dev-standards/skills/handoff/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

```markdown
---
name: dev-standards-handoff
description: "Compact current conversation into a handoff doc (OS temp dir) for a fresh agent to continue. 壓縮對話為交接文檔。 Use when: hand off session, end of session summary, pass work to another agent, prepare context for continuation, dartai session boundary"
disable-model-invocation: true
---

# Handoff

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the **OS temporary directory** (`$TMPDIR` → `/tmp` fallback, `%TEMP%` on Windows) — **not** the current workspace. Name it `<tmpdir>/handoff-<timestamp>.md` and print the absolute path.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.

## Contents

- **Goal / current focus** — what the next session should accomplish.
- **State** — what's done, what's in flight, what's blocked.
- **Suggested skills** — which skills the next agent should invoke (e.g. `dev-standards:diagnose`, `dartai:task`).
- **Pointers, not copies** — do NOT duplicate content already captured in other artifacts (PRDs, plans, ADRs, Dart tasks, commits, diffs). Reference them by path or URL instead.

## Code context

If the lci plugin is available, invoke [[context-handoff]] (`lci:context-handoff`) to save a code context manifest, and reference the manifest's path in the handoff doc so the next agent can restore code context instantly. Fall back to listing key file paths if lci is unavailable.

## Security

Redact any sensitive information — API keys, passwords, tokens, personally identifiable information — before writing the file.

## Presentation

After writing (and redacting) the doc, present it via `present:doc` to open it rendered in the browser. Fall back to printing the absolute path if the `present` plugin / a browser is unavailable.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/productivity/handoff`.
```

- [ ] **Step 2: Validate + budget + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
awk -F'description: ' '/^description:/{print length($2)}' plugins/dev-standards/skills/handoff/SKILL.md
git add plugins/dev-standards/skills/handoff/
git commit -m "feat(dev-standards): add handoff skill (conversation -> temp-dir doc + lci code manifest)"
```

---

## Task 9: New skill `git-guardrails`

Security-adjacent — write the SKILL.md and script in plain English (no caveman/wenyan in the script or blocking messages).

**Files:**
- Create: `plugins/dev-standards/skills/git-guardrails/SKILL.md`
- Create: `plugins/dev-standards/skills/git-guardrails/scripts/block-dangerous-git.sh` (from `/tmp/mp-skills/misc_git-guardrails-claude-code_scripts_block-dangerous-git.sh`)

- [ ] **Step 1: Copy the hook script verbatim** into `scripts/block-dangerous-git.sh`. Read it to confirm it: reads JSON from stdin, matches dangerous git patterns in `tool_input.command`, exits 2 + prints a BLOCKED message to stderr on match, exits 0 otherwise. Make it executable: `chmod +x plugins/dev-standards/skills/git-guardrails/scripts/block-dangerous-git.sh`.

- [ ] **Step 2: Write SKILL.md** (port Matt's `misc/git-guardrails-claude-code/SKILL.md` with soft-guidance framing)

```markdown
---
name: dev-standards-git-guardrails
description: "Set up a Claude Code PreToolUse hook that blocks destructive git commands (push, reset --hard, clean -f, branch -D, checkout .) before they run. Use when: prevent destructive git, add git safety hook, block git push/reset, git guardrails"
disable-model-invocation: true
---

# Git Guardrails

Set up a PreToolUse hook intercepting dangerous git commands before Claude executes them. The blocked list is a **default, not a mandate** — the user picks scope and edits the patterns.

## Default blocked patterns

`git push` (incl. `--force`), `git reset --hard`, `git clean -f` / `-fd`, `git branch -D`, `git checkout .` / `git restore .`. On a match the hook exits 2 and prints a BLOCKED message to stderr; Claude is told it lacks authority for that command.

## Steps

1. **Ask scope.** This project (`.claude/settings.json`) or all projects (`~/.claude/settings.json`)?
2. **Copy the hook script** from this skill's `scripts/block-dangerous-git.sh` to:
   - Project: `.claude/hooks/block-dangerous-git.sh`
   - Global: `~/.claude/hooks/block-dangerous-git.sh`
   Then `chmod +x` it.
3. **Register the hook** in the chosen settings file under `hooks.PreToolUse` with matcher `Bash` and the script path (project: `"$CLAUDE_PROJECT_DIR"/.claude/hooks/block-dangerous-git.sh`; global: `~/.claude/hooks/block-dangerous-git.sh`). Merge into any existing `PreToolUse` array — do not overwrite other hooks.
4. **Offer customization.** Ask whether to add or remove patterns; edit the copied script accordingly. This is the escape valve — keep it explicit.
5. **Verify:**
   ```bash
   echo '{"tool_input":{"command":"git push origin main"}}' | <path-to-script>
   ```
   Expect exit code 2 + a BLOCKED message on stderr.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/misc/git-guardrails-claude-code`.
```

- [ ] **Step 3: Verify the script works**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
echo '{"tool_input":{"command":"git push origin main"}}' | bash plugins/dev-standards/skills/git-guardrails/scripts/block-dangerous-git.sh; echo "exit=$?"
echo '{"tool_input":{"command":"git status"}}' | bash plugins/dev-standards/skills/git-guardrails/scripts/block-dangerous-git.sh; echo "exit=$?"
```
Expected: first prints BLOCKED + `exit=2`; second `exit=0` with no block.

- [ ] **Step 4: Validate + commit**

```bash
claude plugin validate ./plugins/dev-standards
git add plugins/dev-standards/skills/git-guardrails/
git commit -m "feat(dev-standards): add git-guardrails skill (opt-in PreToolUse hook blocking destructive git)"
```

---

## Task 10: New skill `to-issues` (Dart-adapted)

**Files:**
- Create: `plugins/dev-standards/skills/to-issues/SKILL.md`

- [ ] **Step 1: Write SKILL.md** (port Matt's tracer-bullet logic, retarget output from GitHub issues to Dart tasks)

```markdown
---
name: dev-standards-to-issues
description: "Break a plan/PRD into independently-grabbable Dart tasks using tracer-bullet vertical slices (AFK/HITL). Use when: convert plan into tasks, create implementation tickets, break down work into Dart tasks, slice a feature"
disable-model-invocation: true
---

# To Issues

Break a plan into independently-grabbable **Dart tasks** using vertical slices (tracer bullets).

> Prefer `lci:explore` to understand current code state before slicing; fall back to Grep/Read if the lci plugin is unavailable. Use `.claude/rules/glossary.md` vocab in task titles; respect ADRs in the area.

## Process

### 1. Gather context
Work from what's in the conversation. If the user passes a plan/PRD reference (path or Dart task id), read it fully.

### 2. Draft vertical slices
Each slice is a **tracer bullet** — a thin path cutting through ALL layers end-to-end (schema, API, UI, tests), NOT a horizontal slice of one layer.
- Each slice delivers a narrow but COMPLETE path; a completed slice is demoable/verifiable on its own.
- Prefer many thin slices over few thick ones.
- Mark each slice **AFK** (implementable + mergeable with no human interaction) or **HITL** (needs an architectural decision or design review). Prefer AFK where possible.

### 3. Quiz the user
Present the breakdown as a numbered list. Per slice: Title, Type (AFK/HITL), Blocked-by, User-stories-covered. Ask: granularity right? dependencies correct? merge/split any? AFK/HITL correct? Iterate until approved.

### 4. Publish to Dart
For each approved slice, create a Dart task via dart-query `create_task` (routed through slop-mcp), per the repo task-management policy:
- `title` — short, glossary vocab. `dartboard` — the project's dartboard (ask or use the configured default; for this repo `Personal/agnt`).
- `priority` / `size` — **strings** (`high`/`medium`/`low`; `XS`/`S`/`M`/`L`/`XL`), never integers.
- Description — end-to-end behavior + acceptance criteria checkboxes. Avoid file paths/code snippets (they go stale); exception: a prototype-derived snippet that encodes a decision (state machine, schema, type shape).
- **Dependencies:** create children first, then set `subtask_ids` on the parent (dart-query ignores `parentId`). Publish in dependency order so "Blocked by" can reference real task ids.

Do NOT close or modify any parent task.

> Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Original: `skills/engineering/to-issues` (retargeted to Dart).
```

- [ ] **Step 2: Validate + budget + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
awk -F'description: ' '/^description:/{print length($2)}' plugins/dev-standards/skills/to-issues/SKILL.md
git add plugins/dev-standards/skills/to-issues/
git commit -m "feat(dev-standards): add to-issues skill (tracer-bullet slices -> Dart tasks)"
```

---

## Task 11: Enhance `review-for-plan-updates` — deepening framing

**Files:**
- Modify: `plugins/dev-standards/skills/review-for-plan-updates/SKILL.md`

- [ ] **Step 1: Read current skill**

Run: `cat plugins/dev-standards/skills/review-for-plan-updates/SKILL.md`
It already surfaces C-class refactor discoveries post-GREEN.

- [ ] **Step 2: Add a deepening cross-reference**

In the section describing how to characterize a refactor discovery, add:

> When a discovery is architectural (shallow module, missing seam, tangled callers, no test seam — e.g. surfaced by [[diagnose]] Phase 6), frame it in deep-module vocabulary and route a fuller analysis through [[refactor-first-assessment]] (deepening lens). Use the deletion test to decide whether the discovery is load-bearing before proposing a plan update.

- [ ] **Step 3: Validate + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dev-standards
git add plugins/dev-standards/skills/review-for-plan-updates/SKILL.md
git commit -m "feat(dev-standards): review-for-plan-updates frames architectural discoveries via deepening lens"
```

---

## Task 12: dartai light wiring edits

**Files:**
- Modify: dartai planning-phase doc (find with grep)
- Modify: dartai task-execution doc (find with grep)

- [ ] **Step 1: Locate the dartai phase docs**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
grep -rl "refactor-first-assessment\|simple-planning" plugins/dartai/skills/ | head
grep -rl "task-execution\|task-executor" plugins/dartai/skills/ | head
```
Note the planning skill (where grill-task / refactor-first-assessment are referenced) and the task-execution skill.

- [ ] **Step 2: Add `to-issues` to the planning phase**

In the dartai planning skill, where plan→tasks decomposition is described, add a one-line reference: "To break an approved plan into Dart tasks as tracer-bullet vertical slices, use [[to-issues]]." Match the file's language style.

- [ ] **Step 3: Add `diagnose` to the execution phase**

In the dartai task-execution skill, in the debugging/failure guidance, add: "For hard bugs or perf regressions during execution, use [[diagnose]] (feedback-loop-first discipline)." Match the file's language style.

- [ ] **Step 4: Validate + commit**

```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate ./plugins/dartai
git add plugins/dartai/skills/
git commit -m "feat(dartai): wire to-issues into planning + diagnose into execution phases"
```

---

## Task 13: Versioning, marketplace sync, attribution

**Files:**
- Modify: `plugins/dev-standards/.claude-plugin/plugin.json`
- Modify: `plugins/dartai/.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Create or Modify: `NOTICE` (repo root)

- [ ] **Step 1: Bump dev-standards 0.4.4 → 0.5.0**

Edit `plugins/dev-standards/.claude-plugin/plugin.json`: `"version": "0.4.4"` → `"version": "0.5.0"`.

- [ ] **Step 2: Bump dartai 0.10.2 → 0.10.3**

Edit `plugins/dartai/.claude-plugin/plugin.json`: `"version": "0.10.2"` → `"version": "0.10.3"`.

- [ ] **Step 3: Sync marketplace.json**

In `.claude-plugin/marketplace.json`: catalog `"version": "1.8.4"` → `"1.9.0"`; dev-standards entry `"version": "0.4.4"` → `"0.5.0"`; dartai entry `"version": "0.10.2"` → `"0.10.3"`.

Verify:
```bash
cd /home/beagle/work/standardbeagle-tools
grep -nE '"version"|"name": "dev-standards"|"name": "dartai"|"name": "standardbeagle-tools"' .claude-plugin/marketplace.json | grep -E '1\.9\.0|0\.5\.0|0\.10\.3|dev-standards|dartai|standardbeagle-tools'
```
Expected: catalog 1.9.0, dev-standards 0.5.0, dartai 0.10.3.

- [ ] **Step 4: Add NOTICE attribution**

Create/append `NOTICE` at repo root:
```
This marketplace incorporates skills adapted from mattpocock/skills
(https://github.com/mattpocock/skills), © 2026 Matt Pocock, MIT License.

Adapted into the dev-standards plugin:
  handoff, prototype, diagnose, git-guardrails, to-issues, glossary,
  and enhancements to grill-task, decide, refactor-first-assessment,
  review-for-plan-updates, setup-project.

Adapted into the present plugin:
  html-report (HTML-REPORT.md scaffold from improve-codebase-architecture).
```

Note: the `present` plugin's marketplace entry + `0.1.0` version were added in Phase A (Task A1). This task only bumps the catalog version + dev-standards + dartai.

- [ ] **Step 5: Commit**

```bash
git add plugins/dev-standards/.claude-plugin/plugin.json plugins/dartai/.claude-plugin/plugin.json .claude-plugin/marketplace.json NOTICE
git commit -m "chore(release): dev-standards 0.5.0, dartai 0.10.3, catalog 1.9.0 + Matt Pocock attribution"
```

---

## Task 14: Final validation

**Files:** none (verification only)

- [ ] **Step 1: Full marketplace validation**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
claude plugin validate .
```
Expected: passes with no errors.

- [ ] **Step 2: Description budget sweep (all new/changed skills)**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
for s in glossary diagnose prototype handoff git-guardrails to-issues grill-task refactor-first-assessment decide review-for-plan-updates setup-project; do
  len=$(awk -F'description: ' '/^description:/{gsub(/^"|"$/,"",$2); print length($2); exit}' plugins/dev-standards/skills/$s/SKILL.md)
  echo "$s: $len"
done
```
Expected: every length < 1024 (target 150–400 for auto-invocable ones).

- [ ] **Step 3: Headless structure probe**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
tests/run-start-tests.sh structure 2>&1 | tail -20 || echo "harness unavailable — skip per tests/README"
```
Expected: JSON/markdown lint passes, or a clean skip if the harness isn't wired for dev-standards.

- [ ] **Step 4: Reference-integrity check**

Run:
```bash
cd /home/beagle/work/standardbeagle-tools
# every [[wikilink]] target referenced should exist as a skill folder
grep -rho '\[\[[a-z-]*\]\]' plugins/dev-standards/skills/ | sort -u
ls plugins/dev-standards/skills/
```
Expected: every `[[name]]` (glossary, decide, diagnose, refactor-first-assessment, context-handoff) resolves to a real skill folder (note `context-handoff` lives in the `lci` plugin — that cross-plugin link is intentional).

- [ ] **Step 5: Final confirmation (no commit — verification task)**

Report: all skills validate, descriptions within budget, links resolve. Branch `feat/matt-pocock-skills-incorporation` ready for review/merge.

---

## Self-Review notes (author)

- **Spec coverage:** 6 new skills → Tasks 1,6,7,8,9,10. 5 enhancements → Tasks 2,3,4,5,11. Substrate → Tasks 1,2,3. LCI weave → seam prefixes in Tasks 1,4,5,6,8,10. dartai wiring → Task 12. Versioning/attribution → Task 13. Validation → Task 14. All spec sections covered.
- **Type/name consistency:** skill folder→name uses `dev-standards-<folder>` prefix consistently. Wikilinks use bare folder names (`[[glossary]]`, `[[decide]]`, `[[refactor-first-assessment]]`, `[[diagnose]]`, `[[context-handoff]]`).
- **Known soft spots for the implementer:** the enhancement tasks (2,3,4,5,11,12) require reading the current file first because exact insertion points depend on existing structure/language (several dev-standards skills are wenyan-bodied — match that). Reference-file ports (Tasks 1,3,5,7,9) depend on Task 0 fetches succeeding.
```