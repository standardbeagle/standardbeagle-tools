---
name: drift-contract
description: Operational contract for drift test — what "variance < 0.2" means, how to measure, failure response.
---

# Drift Test Contract / 漂移測試契約

## 概覽 (Overview)

同一代碼單元重標十次，測 tagger 輸出之離散度。離散過大則 prompt 不穩、閾值需緊，或模型需換。此契約定可操作之失敗判據，以免「感覺不一致」落入主觀。

## 測試對象 (Target)

- **File**: `tests/risk-pipeline/drift-corpus/unit-sample.ts`
- **Unit under test**: module-level roll-up across `signPayload`, `verifyPayload`, `pairKey`
- **Expected vector** (ground truth, pinned by human review):
  - `b=1` — signPayload has handful of internal callers; not public
  - `d=0` — no persistence, no migration
  - `s=1` — hash-based signing is weak (SHA-256 + secret concat is not HMAC), flag security-low
  - `r=0` — in-memory only, fully reversible
  - `u=0` — standard Node crypto API, well-understood
  - `scalar` = 1×2 + 0×3 + 1×4 + 0×3 + 0×2 = **6**
  - `conf_target` = `[0.80, 0.95]`

## 運行程序 (Procedure)

1. Invoke `risk-tag-unit` skill on `unit-sample.ts` ten times in separate sessions (or ten times in one session with fresh context per run).
2. Collect the ten JSON/YAML outputs into `drift-runs.jsonl` (one object per line).
3. For each axis in `{b, d, s, r, u}`, compute population std dev across the ten integer values.
4. For `conf`, compute population std dev across the ten float values.
5. For `why_theme` (if emitted), collect unique strings; cluster by semantic equivalence (manual or via simple keyword-set overlap).

## 通過標準 (Pass criteria)

| Metric | Threshold | Failure action |
|---|---|---|
| axis-std-dev (each of b/d/s/r/u) | `< 0.2` | tighten prompt examples, re-run |
| conf-std-dev | `< 0.15` | acceptable range wider because conf is continuous |
| axis-mean per axis | within ±0.5 of ground truth | revise ground truth OR prompt if systematic drift |
| why_theme clusters | ≥ 80% collapse to one dominant theme | revise prompt if too fragmented |

`< 0.2` 意一算術平均上下 0.2 之以內。若 b 十次取值為 `[1,1,1,2,1,1,1,2,1,1]`，mean=1.2，std-dev=0.4，則**失敗**。若 `[1,1,1,1,1,1,1,1,1,1]`，std-dev=0.0，**通過**。

## 失敗處置 (Failure response)

漂移超閾之三步排查：

1. **Prompt stability**: re-read `risk-tag-unit.md` prompt template — ambiguous wording? add concrete fixture-derived examples covering the drifted axis.
2. **Model variance**: haiku naturally noisier than sonnet for subjective axes (blast, unknowns). Try sonnet for the problematic axis; accept cost if variance drops.
3. **Ground truth ambiguity**: if mean sits between two integer values (e.g. mean=1.5), the axis is genuinely ambiguous for this code. Widen `conf_target` range in the fixture's EXPECTED.yaml and accept the looser bound — do not force false precision.

## 範例 (Example failure trace)

假設十次運行之 `s` 軸取值 `[1,1,2,1,2,1,2,1,1,2]`：

- mean = 1.4
- std-dev = 0.49 (fails `<0.2`)
- 解讀：prompt 對 "hash-based signing" 是否算 security-low vs security-med 不明確。
- 修：在 risk-tag-unit prompt 加例「SHA-256 + secret concat 非 HMAC，計 s- (1) 非 s+ (2)」。

## 維護 (Maintenance)

- 每次修 risk-tag-unit prompt 或 weights 後重跑漂移。
- 當模型版本升（haiku-4.5 → haiku-5.0），重算 baseline mean — 若偏移 >1 則更新 ground truth。
- 十次採樣為最小統計量；預算允時擴至二十次更穩。
