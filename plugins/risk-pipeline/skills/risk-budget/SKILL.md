---
name: risk-pipeline-risk-budget
description: "Aggregate per-unit @risk tags into task-level risk vector. Propagates blast via LCI callers tree (depth 3, log2 amplification, cap 3). Max across units for d/s/r. Scalar via weighted sum (default s=4 d=3 r=3 b=2 u=2, budget 10). Applies 5-step split SOP with findability hard constraint. Crit axis (=!) triggers specialist review regardless of scalar."
disable-model-invocation: true
---

# risk-budget

## 概覽 (Overview)

單元標聚為任務級風險向量。呼叫方：`risk-classify`（Phase 06）。輸入觸及單元之 `@risk` 標及配置，輸出 `task_risk` 向量、`scalar` 標量、`verdict` 裁決及 `split_proposal` 切片。blast 經 LCI 調用圖放大，data/security/reversibility 跨單元取最大；unknowns 由 classify 自算，此技藝不涉。裁決依五步切分 SOP 與可尋性硬約束（spec §Roll-up, budget, split, lines 230–311）。

## 輸入 (Inputs)

呼叫方必供：

- `touched_units` — 列 `[{file, line_range, unit_name, risk_tags: {b, d, s, r, u, conf, why?, tagged, model}}]`
- `config` — 讀 `.claude/rules/risk.md` frontmatter，取 `weights`、`budget.scalar_max`、`blast_propagation.{lci_depth, caller_log_base}`
- `lci_client` — handle 暴 `callers(unit, depth) → [caller_unit, ...]`

配置缺鍵回退插件默認：權重 `s=4 d=3 r=3 b=2 u=2`、budget `10`、`lci_depth 3`、`caller_log_base 2`。

## 聚合 per-axis (Per-axis roll-up)

### blast

經 LCI 調用圖放大。公式字字對 spec §Per-axis roll-up line 236：

```
for each touched unit u:
  callers_reachable = LCI.callers(u, depth=config.blast_propagation.lci_depth)   # default 3
  amplification = ceil(log2(|callers_reachable| + 1))
  effective_b = min(3, u.risk_tags.b + amplification)

task.b = max(effective_b across touched units)
```

`+1` 守 `log2(0)` 未定義：零調用方時 `amp = ceil(log2(1)) = 0`，退化為原 b 值。`min(3, ...)` 封頂於 crit。

### data, security, reversibility

跨單元取最大：

```
task.d = max(u.risk_tags.d across touched units)
task.s = max(u.risk_tags.s across touched units)
task.r = max(u.risk_tags.r across touched units)
```

單元缺標則視 `0`，並於 `findability_notes` 記提示呼叫方走 `risk-tag-unit` 補標。

### unknowns

**此技藝不計**。`u` 軸由 `risk-classify` 按四信號（lci_symbol_miss、low_coverage、novel_domain、low_tagger_conf）自算。本技藝輸出 `task_risk.u` 留空，呼叫方填入。

## 標量 (Scalar)

```
scalar = Σ(axis_level × axis_weight)
```

默認權重 YAML：

```yaml
weights:
  security: 4      # s
  data: 3          # d
  reversibility: 3 # r
  blast: 2         # b
  unknowns: 2      # u
budget:
  scalar_max: 10
```

計算含 `u` 軸（由 classify 注入）。若呼叫方尚未填 `u`，本技藝按 `u=0` 暫估並於輸出 `notes` 中標註 `scalar_provisional: true`。

## 裁決 (Verdict)

四裁決互斥，優先序列（spec §Hard crit 283–285, §Split SOP 287–311）：

| Condition | Verdict |
|-----------|---------|
| `scalar <= budget` 且無 crit 軸 | `ok` |
| `scalar <= budget` 且有 crit 軸 | `ok`，但附 `crit_axes`（呼叫方派專審） |
| `scalar > budget` 且 Split SOP 出可行切片 | `split_required` |
| `scalar > budget` 且存主導單元 | `refactor_first_required` |
| `scalar > budget` 且 findability 違或有 crit 軸 | `escalate` |

crit 軸覆寫：任一 `axis = !`（3）且 `scalar > budget` → 直升 `escalate`，切分不得延遲專審。

## 拆分 SOP (Split SOP)

五步依序，任一步定論即止（spec §Split SOP lines 287–311）：

**步一：候選切片 (Group into slices)**。按 LCI 調用圖鄰近性 + DOMAIN.md 聚合共屬分組觸及單元。啟發：單元共享公開入口 → 同片；單元屬同 DOMAIN 聚合 → 同片；預算許可時寧少勿多片。

```
slices = group_by(touched_units, key=lambda u: (lci.entry_point(u), domain.aggregate(u)))
```

**步二：片標量 (Per-slice scalar)**。各候選片獨立計 `scalar`，重用步一算法（blast 放大、d/s/r 取 max）。

**步三：片合預算則切 (Split when all slices fit)**。若每片 `scalar <= budget`，按數據流排（生產者先於消費者），返 `split_required` + `split_proposal`。

**步四：主導單元查 (Dominant-unit check)**。若任一片仍超預算：單元獨力貢獻 `> budget` → `refactor_first_required`，插重構任務先解之；無主導單元 → `escalate` 至架構層（複合管道 + 人工檢核）。

```
for slice in slices:
  if slice.scalar > budget:
    dom = [u for u in slice.units if unit_scalar(u) > budget]
    return "refactor_first_required" if dom else "escalate"
```

**步五：可尋性核 (Findability veto)**。見下節硬約束；違則折返單任務 + `escalate`。

## 可尋性 (Findability hard constraint)

兩條明文拒：

1. **REJECT** 切片為持碎片而造新文件（孤兒文件）。
2. **REJECT** 切片散聚合於 N 任務中，而 N 任務皆編同一公開入口。

違之處置：折返單任務 → `escalate` + `findability_notes` 述具體違因（如 `"slice 2 would orphan helper.ts; collapsing"`）。可尋性凌駕預算：寧留單超預算任務經升級管道，勿散碎片。

## crit 硬規則 (Hard crit rule)

任一 `axis = !`（3）強制專審 + runbook，無論 `scalar <= budget`。crit 工作若不可分（如密碼原語替換）可留單任務，出 `crit_axes: [<name>]` 及 `indivisible: true` 提示。呼叫方據此派 security/data/reversibility 專審者，並強制 runbook 產出。

軸名映射（輸出用全名非 glyph）：`b→blast`、`d→data`、`s→security`、`r→reversibility`、`u→unknowns`。

## 輸出 (Output schema)

```yaml
task_risk:
  b: <int 0-3>
  d: <int 0-3>
  s: <int 0-3>
  r: <int 0-3>
  # u supplied by classify — not here
  scalar: <int>
  crit_axes: [<axis name strings>]    # e.g. ["security"], full names not glyphs
verdict: ok | split_required | refactor_first_required | escalate
over_by: <int, 0 when within budget>
split_proposal:                        # present when verdict in [split_required, refactor_first_required]
  - slice_1: {units: [...], scalar: N}
  - slice_2: {units: [...], scalar: N}
findability_notes: "..."               # present when verdict == escalate due to breach
indivisible: <bool>                    # present when crit_axes non-empty + no split possible
notes:                                 # optional diagnostic flags
  blast_fallback: <bool>
  scalar_provisional: <bool>
```

`over_by = max(0, scalar - budget)`。`split_proposal` 非切分裁決時省。`findability_notes` 於 `escalate` 必備。`indivisible: true` 僅 crit 不可分時出。

## 範例 (Examples)

spec §Examples lines 273–283 三例，逐步展中間值。

**例 1 — 全低，2 單元，0 調用方** (`b.d.s.r.u.` 皆 0)：

```
u1: b=0, callers=0 → amp=ceil(log2(0+1))=0 → effective_b=min(3,0+0)=0
u2: b=0, callers=0 → amp=0 → effective_b=0
task.b=max(0,0)=0; task.d=0; task.s=0; task.r=0
scalar = 0×2 + 0×3 + 0×4 + 0×3 + 0×2 = 0
over_by=0; crit_axes=[]; verdict=ok
```

**例 2 — 單元 `b+d.s.r.u.`，8 調用方**（b=2）：

```
amp = ceil(log2(8+1)) = ceil(log2(9)) = ceil(3.17) = 4
effective_b = min(3, 2+4) = 3
task.b=3; task.d=0; task.s=0; task.r=0
scalar = 3×2 + 0×3 + 0×4 + 0×3 + 0×2 = 6
over_by=0; crit_axes=[]; verdict=ok
```

**例 3 — `b+d.s!r-u.` crit security**（b=2, d=0, s=3, r=1, u=0）：

```
task.b=2; task.d=0; task.s=3; task.r=1
scalar = 2×2 + 0×3 + 3×4 + 1×3 + 0×2 = 4+0+12+3+0 = 19
over_by=19-10=9; crit_axes=[security]
crit axis + scalar > budget → verdict=escalate
findability_notes="crit axis security=3 cannot be deferred by split"
indivisible: true (when crit unit fundamentally atomic)
```

## 錯誤與回退 (Error + fallback)

四回退態：

- **LCI 不可得 for blast propagation** → 各單元 `effective_b = u.b`（無放大），出 `notes.blast_fallback: true`；不阻塞。
- **單元標缺** → inline 調 `risk-tag-unit`（Phase 03）補之；補標失敗則該單元視 `unknowns: high`（但 unknowns 軸由 classify 處理，此處僅記 `findability_notes` 中提示 classify 納入信號）。
- **切分無可行片** → `escalate`，`findability_notes="split SOP produced no viable slices"`。
- **配置缺權重或無效** → 用插件默認（`s=4 d=3 r=3 b=2 u=2`、budget `10`），`findability_notes` 附 `"config missing; using plugin defaults"`。
