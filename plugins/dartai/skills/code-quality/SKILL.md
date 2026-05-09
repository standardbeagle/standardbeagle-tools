---
name: dartai-code-quality
description: "Thin dartai wrapper routing review-for-plan-updates proposals into Dart tasks. Quality checklist lives in .claude/rules/code-quality.md + dev-standards:review-for-plan-updates. dartai薄包裝：提案路由至Dart任務。 Use when: code quality review, persist refactor proposals, after quality gate, Phase 4.5"
context: fork
---

# Code Quality (dartai wrapper)

此技能為**持久化包裝器**。所有審查邏輯、觸發目錄及提案格式在`dev-standards:review-for-plan-updates`中。代碼品質標準（清單、錯誤處理、可發現性、清理）在`.claude/rules/code-quality.md`中——勿在此重複。

## What this skill does

1. 以任務diff調用`dev-standards:review-for-plan-updates`
2. 對每個返回的提案：
   - 對照`.claude/refactor-rejects.txt`計算其指紋
   - 若未被拒絕，在`refactor-backlog`文件夾中創建Dart任務，標記`origin:review`、`parent:<task-id>`、`urgency:<low|medium|high>`
3. 返回摘要：持久化提案數、被拒絕列表跳過數

## What this skill does NOT do

- 直接評估代碼品質——該內容已移至`.claude/rules/code-quality.md`，規則文件自動加載
- 運行linters——使用語言特定的lint命令（見`.claude/rules/testing.md`）
- 決定是否立即安排提案——這是計劃者在下一計劃週期的決策
- 編輯代碼——任何情況下永不

## Invocation

```
Called by:
  dartai:adversarial-quality-loop Phase 4.5
Returns:
  { persisted: <count>, rejected: <count>, total: <count> }
```

## Dart task format for persisted proposals

```yaml
dart_task:
  dartboard: "<same dartboard as surfacing task>"
  folder: "refactor-backlog"
  title: "<proposal.title>"
  description: |
    ## Origin
    Surfaced by review of task <surfacing-task-id> on <date>.

    ## Trigger
    <proposal.trigger>

    ## Evidence
    - Symbol: <proposal.evidence.symbol>
    - Observation: <proposal.evidence.observation>
    - Callers affected: <proposal.evidence.callers>

    ## Rationale
    <proposal.rationale>

    ## Estimated tier
    <proposal.estimated_tier>
  status: "To-do"
  priority: "Low | Medium | High"     # maps from urgency
  tags:
    - "origin:review"
    - "parent:<surfacing-task-id>"
    - "urgency:<low|medium|high>"
    - "principle:refactor-discipline.C"
```

## Reject list

`.claude/refactor-rejects.txt`為換行分隔的指紋列表。每個指紋為`<symbol>:<trigger>`。持久化提案前，計算其指紋，若存在則跳過。計劃者拒絕提案時追加到此文件。

## Related

- `dev-standards:review-for-plan-updates` — 此包裝器調用的審查者
- `dev-standards:grill-task` — 提案被接受時，以普通任務進行審查
- `.claude/rules/code-quality.md` — 項目特定代碼品質標準
- `.claude/rules/refactor-discipline.md` — A/B/C重構規則
