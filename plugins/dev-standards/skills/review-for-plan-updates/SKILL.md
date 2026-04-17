---
name: review-for-plan-updates
description: After a task reaches GREEN and before the quality gate commits, surface C-class refactor discoveries as structured plan-update proposals. 任務綠燈後，呈 C 類重構發現供規劃者取捨。 Use when: task just passed tests, before quality gate commit, surface refactor proposals, review completed task for technical debt, post-GREEN review
---

# Review for Plan Updates

審視剛完成任務的 diff，呈 C 類重構發現。不修改任務，不編輯代碼。生成結構化提案，由規劃者在完整發布節奏上下文中決定取捨。

## When to run

- 任務最後一個 GREEN 測試通過後
- 質量門控提交前
- 範圍鎖定——發現絕不修改剛完成的任務

## Inputs

- `git diff <task-base>..HEAD` — 僅任務觸及的文件
- LCI call graph one hop out from changed symbols (see who is affected)
- `.claude/rules/karpathy-principles.md`
- `.claude/rules/refactor-discipline.md` (urgency thresholds, backlog config)
- `.claude/rules/code-quality.md` (project-specific complexity limits)

## Trigger catalog (C-class only)

尋找以下模式。每項示例展示信號與對應發現措辭：

| Signal | Example finding |
|---|---|
| Parameter bloat | "`createOrder` now has 9 params + 3 overloads — options object or builder" |
| Cross-task duplication | "Same validation pattern now written 3× across `checkout/`, `cart/`, `admin/`" |
| Naming drift | "`User`, `Account`, `Customer` all used for same concept — pick one in DOMAIN.md" |
| Grown responsibilities | "`OrderService` crossed 400 lines across last 3 tasks — split candidate" |
| Test setup duplication | "Same fixture built inline in 5 tests — extract builder" |
| Visible complexity debt | "Nested conditional now 4-deep in `applyDiscount` — guard-clause or state machine" |
| Dead branches | "Feature-flag branches exist for a flag that has been on everywhere for 30+ days" |

**不審查：**樣式偏好、未用導入、格式、任何 linter 已處理之項。

## Detection thresholds (read from `.claude/rules/code-quality.md`)

閾值由項目自定。規則文件無覆蓋時默認：

- Parameters: flag at 5+
- Method lines: flag at 30+
- File lines: flag at 400+
- Nesting depth: flag at 4+
- Duplication: flag at 3+ copies across files

應用前讀取項目 `code-quality.md` 中的覆蓋值。

## Output format

生成 YAML 文件，含 `proposals` 列表。每條提案為結構化數據，非散文：

```yaml
proposals:
  - title: "Extract OrderCreation options object"
    trigger: parameter_bloat
    evidence:
      symbol: "src/orders/create.ts:createOrder"
      observation: "9 params, 3 overloads, callers pass flags positionally"
      callers: 14   # from LCI
    rationale: "Options object removes positional confusion"
    estimated_tier: standard
    blocks: []
    urgency: low            # low | medium | high
    principle: refactor-discipline.C
```

提案引用證據；不嵌入代碼。

## Deferred decisions (for the planner, not the reviewer)

審查者不決策。決策屬於調用插件的規劃者——彼見發布節奏、進行中事項及團隊優先級。

- **Accept now** — 提案作正常任務審問並排期
- **Defer** — 以緊迫度標簽入 backlog；隨時間晉升
- **Reject** — 標記為已拒絕，附一行理由；記錄指紋防重複提案

## Reject-list discipline

生成提案前，從（`evidence.symbol`，`trigger`）計算指紋，在 `.claude/refactor-rejects.txt` 的拒絕列表中查驗。若存在則跳過生成。拒絕列表由規劃者在拒絕提案時寫入，存於項目，不在插件中。

## Routing (plugin-specific wrappers handle this)

- **dartai** — 提案成為 `refactor-backlog` 文件夾中的 Dart 任務，標記 `origin:review`，並附帶發現它的任務鏈接。
- **workflow** — 提案追加到 `.workflow/loop-state.json` 的 `pending_plan_updates[]` 下。

此技能返回 YAML；包裝器負責持久化。

## Discipline

- **決不編輯代碼。** 剛完成的任務範圍鎖定。此處任何編輯均違反 refactor-discipline.B。
- **決不決策。** 你只見 diff。接受/推遲/拒絕需要更廣上下文。
- **證據，非代碼。** 提案引用符號與文件行號。規劃者按需讀取文件。
- **提案簡短。** 每條提案不超過 20 行 YAML。若理由需更多，任務模糊——改善信號，而非擴展提案。

## Related skills

> Invoke the `Skill` tool with `skill: dev-standards:grill-task` — 被接受的提案作為新任務進行審問。

> Invoke the `Skill` tool with `skill: dev-standards:decide` — 若提案觸及架構決策，接受時調用 decide。
