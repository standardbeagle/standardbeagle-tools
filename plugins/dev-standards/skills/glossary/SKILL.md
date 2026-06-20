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
