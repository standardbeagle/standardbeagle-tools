---
name: risk-pipeline-tests
description: Test strategy and data for risk-pipeline — fixtures, unit cases, reference replay set, drift corpus, fuzz corpus. No harness code; that is Phase 16+ work.
---

# Risk-Pipeline Test Strategy / 風險管道測試方略

## 概覽 (Overview)

本目錄為 risk-pipeline 之 **測試方略 + 鎖定數據**，非可執行測試套件。risk-pipeline 核心（risk-classify、risk-budget、risk-pipeline-dispatch、risk-tag-unit）為 Claude 技藝（markdown prompts），非可獨立執行之代碼函數。故「單測」實為「期望表」：輸入 + 預期輸出，日後由 harness（bash/Python/Node）消費以驗行為。

此方略之用：Phase 15 鎖當期行為、Phase 16 翻 authoritative 前可對比 shadow vs authoritative 無退化、日後 prompt 調整後可回歸驗。

## 範圍 (Scope) — 7 測試類別

| # | Category | Target | Data |
|---|---|---|---|
| 1 | Synthetic projects | tagger (`risk-tag-unit`) | `fixtures/` TS/Py/Go + `EXPECTED.yaml` |
| 2 | classify unit cases | `risk-classify` | `unit-cases/classify.jsonl` |
| 3 | budget unit cases | `risk-budget` | `unit-cases/budget.jsonl` |
| 4 | dispatch unit cases | `risk-pipeline-dispatch` | `unit-cases/dispatch.jsonl` |
| 5 | Reference replay | end-to-end classify | `reference-set.jsonl` (30 entries) |
| 6 | Drift test | tagger stability | `drift-corpus/unit-sample.ts` + `drift-contract.md` |
| 7 | Fuzz | parser tolerance | `fuzz-corpus/malformed.txt` + `parser-contract.md` |

## 契約 (Harness contract)

未來 harness 將按以下方式消費本目錄：

### classify

```
for case in classify.jsonl:
  invoke Claude with risk-classify prompt + case.inputs
  parse YAML/JSON output
  assert output.verdict == case.expected.verdict
  assert output.pipeline_tier == case.expected.pipeline_tier
  assert set(output.required_reviewers) == set(case.expected.required_reviewers)
  assert output.tdd_required == case.expected.tdd_required
  assert output.impl_model == case.expected.impl_model
```

### budget

```
for case in budget.jsonl:
  invoke Claude with risk-budget prompt + case.inputs
  parse output
  assert output.task_risk == case.expected.task_risk
  assert output.scalar == case.expected.scalar
  assert output.verdict == case.expected.verdict
  assert output.crit_axes == case.expected.crit_axes
```

### dispatch

`risk-pipeline-dispatch` 為**決定性**技藝——無 LLM 必要，純表查找。harness 可直接純代碼實作，無需 invoke Claude。classify/budget 可選 LLM 或代碼查表（二者應同果）。

### Reference replay

```
for entry in reference-set.jsonl:
  invoke risk-classify with entry.task_spec + entry.touched_files
  compare output.verdict vs entry.hand_label.verdict
  compare output.tier vs entry.hand_label.tier
  log diff; compute agreement rate
```

### Drift

```
for i in 1..10:
  invoke risk-tag-unit on drift-corpus/unit-sample.ts
  append output to drift-runs.jsonl
compute std dev per axis, compare vs drift-contract.md thresholds
```

### Fuzz

```
for line in fuzz-corpus/malformed.txt:
  parse with production @risk parser
  assert no throw
  capture warn/skip/partial state
compare vs parser-contract.md expected behavior
```

## Fixture 約定 (Fixture conventions)

- 每 `.ts/.py/.go` 檔攜其生產感之 `@risk` 標註（TS JSDoc / Py docstring / Go doc comment，依 codedoc-schema.md）。
- 每語言目錄含 `EXPECTED.yaml`，映射 `filename → units[{name, b, d, s, r, u, conf_target, why_theme, why_required, module_risk}]`。
- `conf_target` 為浮點範圍 `[lo, hi]`；tagger 輸出 `conf` 在範圍內則通過。範圍寬度反映人工判斷之不確定——ambiguous 單元範圍寬（0.70–0.95），明確單元範圍窄（0.85–1.00）。
- `why_theme` 為自由字串類別描述（"signature bypass", "pure formatting"）；harness 比對時用語義相似而非精確匹配。
- `why_required: true` 標示該單元 `!` 軸觸之，tagger 必發 `@risk-why` 行。
- `module_risk` = 跨單元之各軸 `max()`。scalar 按默認權重 `s*4 + d*3 + r*3 + b*2 + u*2`。

## unit-cases 約定 (Unit-case conventions)

每 JSONL 檔每行一 `{case_id, description, inputs, expected}` 對象。格式：

```json
{
  "case_id": "c01",
  "description": "human-readable summary",
  "inputs": { /* fields the skill consumes */ },
  "expected": { /* fields to assert */ }
}
```

- `case_id` 唯一於檔內
- `description` 英文簡述何為測
- `inputs` 供技藝之輸入；例如 classify 取 task_spec + touched_files
- `expected` 為比對斷言對象——harness 比對欄按 `==`（簡單類型）或 `set(...)` 相等（roster 陣列）

## 覆蓋 (Coverage) 目標

| Category | Case count | Coverage target |
|---|---|---|
| classify.jsonl | 22 | 8 scenarios: trivial bypass×3, low-scalar×3, mid-scalar×3, high-scalar×2, crit-security×3, crit-data×2, split×2, refactor-first×2, edge×2 |
| budget.jsonl | 16 | blast formula (zero/single/8/100/1000 callers), max-cap, multi-unit max, d/s/r max, crit single/multi, under/over budget, split/refactor/escalate, LCI fallback |
| dispatch.jsonl | 16 | trivial smoke, all-`.`, b/d/s/r/u each trigger, crit each axis, multi-crit, scalar tiers (0-4 / 5-9 / 10-14 / 15+), escalate-without-crit |
| reference-set.jsonl | 30 | 5 agnt / 6 bifrost / 19 others, verdicts {ok:22, split:4, escalate:3, refactor:1}, tiers {light:12, dim_matched:10, architectural:5, smoke:3} |

## 通過標準 (Pass criteria)

| Test | Pass threshold |
|---|---|
| Synthetic (fixtures) | ≥ 85% axis agreement with `EXPECTED.yaml`; conf within `conf_target` range |
| classify unit cases | 100% — deterministic expected output |
| budget unit cases | 100% — pure arithmetic, no LLM variance |
| dispatch unit cases | 100% — pure table lookup |
| Reference replay | ≥ 80% verdict agreement; ≤ 5 diverge; all critical disagreements (crit axis misses) manually triaged |
| Drift | all axes std-dev `< 0.2`; conf std-dev `< 0.15`; see `drift-corpus/drift-contract.md` |
| Fuzz | 100% of corpus processed without throw/panic; `warn/skip/partial` counts match `parser-contract.md` |

## 漂移測試 (Drift test) — 操作化

見 `drift-corpus/drift-contract.md`。簡言：重跑 tagger 10 次於同單元，收 JSON 輸出，算各軸 std dev。`< 0.2` 通過。

## Fuzz 測試 — 操作化

見 `fuzz-corpus/parser-contract.md`。`malformed.txt` 一行一畸形輸入，56 行覆 12 類畸形：缺軸、多軸、數字 levels、錯序、錯 glyph、畸形 date、conf 越界、未知 model、多行分割、HTML/SQL 注入、unicode/emoji、大小寫/空白/制表。

## 執行 (Running) — 現狀

無自動 harness；此階段僅交付策略+數據。日後 `tests/risk-pipeline/run.sh` 可期：

```bash
# Placeholder for future harness
./run.sh --suite classify
./run.sh --suite reference-replay --output results.jsonl
./run.sh --suite drift --iterations 10
./run.sh --suite fuzz
```

手動運行（現階段）：

1. 取 classify.jsonl 一 case，以 `inputs.task_spec` + `inputs.touched_files` 喂 Claude 於一新 session，invoke `risk-classify` skill。
2. 人工比對輸出 vs `expected`。
3. 記 PASS/FAIL 於 scratch。
4. 全 case 重複。

## 維護 (Maintenance)

- **New fixture**: 於 `fixtures/<lang>/` 加碼檔，更新同目錄 `EXPECTED.yaml`。
- **New unit case**: append 行於對應 JSONL。勿重用 `case_id`。
- **Reference set stability**: 週期性重標歷史任務，對比 hand_label 是否仍反映當期判斷。重大 weight 調整後整集重校。
- **Drift re-baseline**: model 升級後重算 baseline mean，若偏移 >1 則更新 ground truth。
- **Fuzz corpus**: append-only；既有行勿刪——退化保護累積需留。

## 限界 (Out of scope)

- Harness code（bash/Python/Node）—— Phase 16+。
- CI 整合—— Phase 17。
- Live Claude API 調用工具—— Phase 16。
- 對比工具 hand_label vs live classify output —— Phase 16。
- 真實歷史任務挖掘—— 用 synthesize 可信條目代之（reference-set 之 30 條為合成）。

## 依賴 (Dependencies)

本方略鎖定以下技藝/規則之當期行為：

- `plugins/risk-pipeline/rules/risk-pipeline/codedoc-schema.md` — `@risk` tag 格式
- `plugins/risk-pipeline/skills/risk-tag-unit.md` — tagger
- `plugins/risk-pipeline/skills/risk-classify.md` — 任務分級
- `plugins/risk-pipeline/skills/risk-budget.md` — 標量+裁決
- `plugins/risk-pipeline/skills/risk-pipeline-dispatch.md` — reviewer/model/tdd
- `plugins/dev-standards/assets/templates/rules/risk.md` — 權重+預算配置默認

prompt 或權重改則此目錄數據需重校——先此測試再啟 Phase 16 authoritative 切換。
