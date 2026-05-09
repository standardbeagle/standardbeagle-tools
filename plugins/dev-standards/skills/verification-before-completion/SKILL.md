---
name: dev-standards-verification-before-completion
description: "聲稱完成、修復或通過前必先執行驗證命令並確認輸出。Run verification commands and confirm output before claiming work is complete, fixed, or passing — evidence before assertions, always. Use when: about to claim a task is done/fixed/passing, before committing or creating PRs, before delegating downstream work, dartai:task-executor Phase 9 final validation. 用於：將稱任務完成/修復/通過時、提交或建 PR 前、委派下游工作前、dartai:task-executor Phase 9 最終驗證階段。Skip when: explicitly reporting an in-progress state with no completion claim; verification commands genuinely don't exist for the change type (rare — usually means the change shouldn't ship)."
---

<!--
Originally ported from Superpowers (`verification-before-completion`).
Upstream: https://github.com/obra/superpowers — license per upstream repo.
Body content preserved verbatim; only frontmatter normalized per
standardbeagle-tools R1 §2.2 (bilingual Use when/Skip when triggers added).
This skill is referenced from plugins/dartai/agents/task-executor.md Phase 9
as the canonical pre-completion verification gate.
-->

# Verification Before Completion

## Overview

未驗而稱成，非效率，乃欺也。

**核心原則：** 證據先於言，常然。

**違其字即違其意。**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

本輪未執驗證令，不得稱其過。

## The Gate Function

```
未稱任何狀態或表滿意之前：

1. IDENTIFY：何令可證此言？
2. RUN：全令執之（新、完）
3. READ：全輸出，視 exit code，數 failure
4. VERIFY：輸出印證所言否？
   - 否：以證述真狀
   - 是：言之並附證
5. 方可：出言

缺一步 = 欺，非驗
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| 測試過 | 測試令輸出：零失敗 | 前次執行，「應當過」 |
| Linter 乾淨 | Linter 輸出：零錯 | 部分檢，推斷 |
| 構建成 | 構建令：exit 0 | Linter 過，日誌似佳 |
| Bug 修 | 測原症：過 | 改碼，假定已修 |
| 回歸測作 | 紅綠環已驗 | 一次過 |
| Agent 成 | VCS diff 示變 | Agent 報「成」 |
| 需求達 | 逐行核對 | 測過 |

## Red Flags - STOP

- 用「應」、「或」、「似」
- 未驗而表滿意（「好！」「完美！」「妥！」等）
- 將 commit/push/PR 而未驗
- 信 agent 成功之報
- 依部分驗證
- 思「僅此一次」
- 倦而欲畢
- **任何言辭暗示成功而未執驗證**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| 「今當作矣」 | 執驗令 |
| 「吾信之」 | 信 ≠ 證 |
| 「僅此一次」 | 無例外 |
| 「Linter 過」 | Linter ≠ 編譯器 |
| 「Agent 言成」 | 獨立驗之 |
| 「吾倦」 | 倦 ≠ 辭 |
| 「部分足矣」 | 部分證無 |
| 「異辭故律不適」 | 意勝字 |

## Key Patterns

**Tests:**
```
✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"
```

**Regression tests (TDD Red-Green):**
```
✅ Write → Run (pass) → Revert fix → Run (MUST FAIL) → Restore → Run (pass)
❌ "I've written a regression test" (without red-green verification)
```

**Build:**
```
✅ [Run build] [See: exit 0] "Build passes"
❌ "Linter passed" (linter doesn't check compilation)
```

**Requirements:**
```
✅ Re-read plan → Create checklist → Verify each → Report gaps or completion
❌ "Tests pass, phase complete"
```

**Agent delegation:**
```
✅ Agent reports success → Check VCS diff → Verify changes → Report actual state
❌ Trust agent report
```

## Why This Matters

From 24 failure memories:
- your human partner said "I don't believe you" — 信崩
- 未定義函數出 — 必潰於 prod
- 缺需求出 — 功未全
- 時耗於偽成 → 返工 → 重作
- 違：「誠為本。欺者，廢之。」

## When To Apply

**ALWAYS before:**
- 任何稱成/完之變體
- 任何表滿意之辭
- 任何正面陳述
- Committing、PR creation、task completion
- 進次任務
- 委 agent

**Rule applies to:**
- 原句
- 改說與同義
- 暗含成功之意
- 任何暗示完備/正確之言

## The Bottom Line

**驗無捷徑。**

執令。讀輸出。方言其果。

此律不可議。
