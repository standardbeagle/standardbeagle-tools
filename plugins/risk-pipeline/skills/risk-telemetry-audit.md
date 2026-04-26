---
name: risk-telemetry-audit
description: "Replay .risk-pipeline/telemetry.jsonl to surface calibration drift: false-skip rate (low-scored tasks with post-deploy bugs), over-review rate (high-scored tasks reviewers pass empty), token/time distribution per pipeline tier. Emits markdown audit report with weight/budget tuning recommendations. Default window: --last 50 or --since 30d."
context: fork
agent: general-purpose
---

<!-- CC 2.1 fork decision: workflow driver — replays telemetry JSONL across hundreds of records, computes 8 calibration metrics, generates markdown audit report. Multi-phase analysis with sub-skill calls. Forking keeps the calling /risk-pipeline:audit command's context free of intermediate calculation chatter; parent receives only the final markdown/JSON report. Executor: general-purpose (no specialist agent — this is pure analytical drive). -->


# risk-telemetry-audit

## 概覽 (Overview)

此技藝為管道之自省。既累遙測，須回測：低分任務有無後漏漏？高分任務審之皆空？token 與 wall 有無異常離群？閱所積 JSONL，計八指標，得調權之建議，筆為 markdown 報。**勿自改配置**——唯陳事與議，人斷之。

## 輸入 (Inputs / flags)

| Flag | Arg | Default | Effect |
| --- | --- | --- | --- |
| `--last` | `N` | `50` | Most recent N task-level entries |
| `--since` | `DATE` | — | Entries after date (ISO `YYYY-MM-DD` or relative `30d`/`7d`) |
| `--scope` | `GLOB` | — | Filter by touched-file patterns (joined from queue cross-ref) |
| `--include-tagger` | — | `off` | Include tagger-level records in analyses (token/conf sections) |
| `--format` | `md`\|`json` | `md` | Output format |
| `--threshold-drift` | `FLOAT` | `0.15` | Minimum drift ratio (0–1) to flag in recommendations |
| `--dry-run` | — | `off` | Compute and print; skip disk write |

`--last` 與 `--since` 互斥；兩給則 `--since` 勝並警告。`--scope` 需先索引 `queue.jsonl` 以交叉連 task_id → file paths。

## 輸入源 (Telemetry streams)

單檔雙記錄制 — `.risk-pipeline/telemetry.jsonl` 既由 orchestrator 寫任務級記錄，亦由 `tag-changed-units.sh` 鉤子與 `risk-tag-sweep` 技藝寫標籤級記錄。以**判別器 `task_id` 欄之有無**分之：

- **Task-level record** — 有 `task_id` 欄。由 `risk-pipeline-dispatch` 技藝於任務完成後追加。
- **Tagger-level record** — 無 `task_id`；有 `outcome` 欄取值 `enqueued`、`tagged`、`skipped` 或 `failed`。由鉤子腳本與 sweep 技藝追加。

單檔之由：遙測路徑為 `risk_pipeline.telemetry.path` 配置之唯一鍵，spec §Telemetry 亦以單檔示例。分檔將擴配置面、破既有鉤子寫入、增審計跨檔合流之複雜。單檔容雙型，判別明確可處。

畸行（JSON 不可解析）記於計數後略過，勿廢全流。畸比過 10% 發警報（詳見下錯誤段）。

## 分析 (Analyses)

依序計以下八指標：

1. **False-skip rate (漏審率)** — `pipeline ∈ {smoke, light}` 且 `real_issues_found` 非空之任務比例。意：輕管道放行了真問題 → 權數偏寬。分母為同期輕管道總數。
2. **Over-review rate (過審率)** — `pipeline == architectural` 或 `scalar ≥ 15` 且所有 reviewer 返 `issues_found` 為空之任務比例（以 `real_issues_found` 空為佐）。意：高分被過度審視 → 權數偏嚴。
3. **Retry rate per reviewer (各審者重試率)** — `retries` 欄按 `reviewers[]` 攤分（平均或最大，取 `retries / len(reviewers)` 近似），聚合為各 reviewer 名之重試頻次。過 20% 者：agent prompt 質次，候選修。
4. **Token cost distribution (token 成本分佈)** — 對每 tier（smoke/light/dim_matched/architectural）計 `tokens.impl + tokens.review + tokens.tagger` 之均值與樣本標準差；逐任務標識 `> μ + 2σ` 為離群。
5. **Wall time distribution (耗時分佈)** — 同上法施於 `wall_ms`。識慢 tier 及離群任務。
6. **Reviewer false-positive rate (審者假陽率)** — 按 reviewer 計 `(issues_reported - real_issues_found_overlap) / issues_reported`。需 reviewer-level issue 記錄；若 schema 未含，以近似 `len(reviewers) - len(real_issues_found) == 0` 推論並標註「approx」。
7. **Axis drift (軸漂移)** — 逐軸（b/d/s/r/u）比對任務級 `risk.<axis>` 平均分與標籤級 `@risk` 同軸平均分。差距 > `--threshold-drift` 者：該軸權數待調。需 `--include-tagger` 方算。
8. **Tagger confidence distribution (標籤器信心分佈)** — 標籤級記錄中 `conf` 欄之分佈；`conf < 0.7` 之單元數為候選重標對象。

分母不足（< 5 樣本）之指標標「low-confidence」並仍印，勿隱。

## 建議規則 (Recommendation heuristics)

指標既得，依下規轉為可動議。每議附：優先級（high/med/low）、**具體配置變更**、量化理由、信心（based on sample size）。

1. **False-skip > 10% over last 30d** → **high** 優先。議：降 `risk_pipeline.budget.scalar_max` 1 分；或升主導漏審類問題之軸權數 1（如漏審中 security 佔多，升 `weights.security`）。理由：輕管道過寬，需重新校準入口門檻。
2. **Over-review > 30%** → **medium** 優先。議：升 `scalar_max` 1 分；或降主導打分之軸權數 1。理由：高分任務審無所獲，成本虛耗。識「主導軸」：對高分任務計每軸對 scalar 之貢獻均值，取最大者。
3. **Token cost tier > 2σ (持續 ≥ 3 任務)** → **medium** 優先。議：該 tier 之 `model` 降級（sonnet-4.6 → haiku-4.5）或縮 `reviewers` 陣列。理由：成本離群可能為過配模型。
4. **Retry rate > 20% 於某 reviewer** → **high** 優先。議：重審該 reviewer agent prompt，或於 `review_stack` 中暫移該 reviewer 做 A/B 比對。理由：重試率高示 agent 輸出不穩。
5. **Axis drift > `--threshold-drift`** → **medium** 優先。議：調該軸 `weights.<axis>` 向標籤級均值靠攏（每次 ±1，勿躍）。理由：任務級與單元級分歧示權數失校。
6. **Tagger low-conf > 15% of tagged units** → **low** 優先。議：批量 `--include-tagger` 跑 `/risk-pipeline:tag-sweep --force --scope <low-conf-paths>` 以 sonnet-4.6 重標。理由：haiku 信心不足，升模型復跑。
7. **Wall time tier > 2σ** → **low** 優先。議：審查該 tier 是否啟用了不必要的 sequential reviewer；考慮並行化。

議按優先級排序，輸出前 10 條。各議註明**預期效果方向**（如「→ 預計 false-skip 降 5–10%」）；具體數字依樣本規模標信心區間。

## 報告結構 (Markdown report structure)

`--format md` 時，布局如下：

```markdown
# Risk Pipeline Audit — <range>

## Summary
- Window: <range>  (e.g. last 50 tasks / since 2026-03-22)
- Tasks analyzed: N  (task-level records)
- Tagger records: M  (if --include-tagger)
- Malformed lines skipped: K
- Pipeline tier distribution: smoke X / light Y / dim_matched Z / architectural W

## Key metrics
| Metric | Value | Threshold | Flag |
| --- | --- | --- | --- |
| False-skip rate | 12% | <10% | ⚠ |
| Over-review rate | 28% | <30% | ✓ |
| Avg tokens (architectural) | 24.1k | — | — |
| Avg wall (architectural) | 14m | — | — |
| ... | ... | ... | ... |

## Reviewer health
| Reviewer | Invocations | Retry rate | False-positive rate |
| --- | --- | --- | --- |
| qa | 34 | 6% | approx 18% |
| security | 12 | 25% | approx 8% |
| ... | ... | ... | ... |

## Axis drift (if --include-tagger)
| Axis | Task avg | Tagger avg | Drift | Flag |
| b | 1.4 | 1.2 | 0.14 | ✓ |
| s | 2.1 | 1.3 | 0.38 | ⚠ |
| ... | ... | ... | ... | ... |

## Recommendations
1. **[high]** Lower `budget.scalar_max` 10 → 9 — false-skip 12% over last 30d (N=42). Confidence: medium.
2. **[high]** Revise `security-reviewer` agent prompt — retry rate 25% (N=12). Confidence: low (sample).
3. ...

## Outlier tasks
| task_id | tier | reason |
| abc123 | architectural | tokens 3.1σ over tier mean (78k) |
| ... | ... | ... |

## Tagger health (if --include-tagger)
- Avg conf: 0.83
- Low-conf (<0.7) units: 24 — candidates for `/risk-pipeline:tag-sweep --force`

## Appendix — raw metrics
```json
{ ...all computed metrics... }
```
```

## JSON 格式 (JSON output format)

`--format json` 時，結構化如下，供下游腳本消費：

```json
{
  "window": {"last_n": 50, "since": null, "from_ts": "...", "to_ts": "..."},
  "counts": {"tasks": 42, "tagger": 0, "malformed": 1,
             "by_tier": {"smoke": 10, "light": 18, "dim_matched": 11, "architectural": 3}},
  "metrics": {
    "false_skip_rate": 0.12,
    "over_review_rate": 0.28,
    "reviewer_retry": {"qa": 0.06, "security": 0.25},
    "reviewer_fp_approx": {"qa": 0.18, "security": 0.08},
    "token_distribution": {"architectural": {"mean": 24100, "sd": 5200, "outliers": ["abc123"]}},
    "wall_distribution": {"architectural": {"mean": 840000, "sd": 120000, "outliers": []}},
    "axis_drift": {"b": 0.14, "s": 0.38},
    "tagger_conf": {"mean": 0.83, "low_conf_count": 24}
  },
  "recommendations": [
    {"priority": "high", "change": "scalar_max: 10 -> 9",
     "rationale": "false-skip 12% over last 30d",
     "confidence": "medium", "expected_effect": "false-skip -5 to -10%"}
  ],
  "outliers": [
    {"task_id": "abc123", "tier": "architectural", "metric": "tokens", "z_score": 3.1}
  ]
}
```

## 實施路徑 (Implementation path)

1. 讀 `.claude/rules/risk.md` 配置：取 `risk_pipeline.telemetry.path`（默認 `.risk-pipeline/telemetry.jsonl`）與 `telemetry.enabled`。`enabled == false` 則仍跑——審計不理會配置開關。配置缺則全用默認並註明於報告 Summary。
2. 開檔流式讀行。逐行 `JSON.parse`；失敗增 `malformed` 計數並記至 `.risk-pipeline/audit.log`，繼讀。
3. 依 `--last N`（尾 N 行過濾器，於任務級流上算）或 `--since DATE`（`ts` 比對；`Nd` 解為 now-Nd）過濾。`--scope` 給則需交叉 `queue.jsonl` 以 task_id → files 之映射，匹 glob。
4. 依判別器分兩流：task-level（有 `task_id`）與 tagger-level（無）。
5. 逐指標（§分析 1–8）計算；樣本不足（< 5）標 low-confidence 仍保留。
6. 應用建議啟發式（§建議規則）；每議附優先級、理由、信心、預期效果。
7. 依 `--format` 渲染輸出。
8. 寫 `.risk-pipeline/audit-reports/<ISO-timestamp>.md`（或 `.json`），除非 `--dry-run`。目錄不存在自建。stdout 印報告路徑（md）或報告全文（json）。

## 輸出 (Final output)

- **`--format md` 常態**：markdown 報告寫至 `.risk-pipeline/audit-reports/<ISO>.md`；stdout 印絕對路徑。
- **`--format json`**：JSON 寫至 `.risk-pipeline/audit-reports/<ISO>.json`；stdout 印全文（除非 `--dry-run`，則僅印路徑）。
- **`--dry-run`**：計算完成但不寫檔；報告全文印 stdout（md 或 json 皆然）。

退出碼：

- `0` — 報告生成成功
- `2` — 遙測檔缺或空（建議：「no data yet; run the pipeline on real tasks」）
- `3` — 畸行比 > 10%（建議：檢查寫入端；考慮備份後截斷）

## Schema 參考 (Schema reference)

### Task-level record (emitted by risk-pipeline-dispatch)

```json
{
  "task_id": "string",
  "pipeline": "smoke | light | dim_matched | architectural",
  "risk": {"b": 0, "d": 0, "s": 0, "r": 0, "u": 0},
  "scalar": 0,
  "reviewers": ["qa", "security", "code-quality"],
  "model": "haiku-4.5 | sonnet-4.6 | opus-4.7",
  "tokens": {"impl": 0, "review": 0, "tagger": 0},
  "wall_ms": 0,
  "outcome": "pass | fail | blocked",
  "retries": 0,
  "real_issues_found": ["string"]
}
```

欄說：

- `risk` — 五軸整數 0–3（b=blast, d=data, s=security, r=reversibility, u=unknowns）
- `scalar` — 加權總分
- `reviewers` — 實際召之審者清單
- `real_issues_found` — 事後驗證為真之問題清單（留空表 commit 後無後續修復；用於 false-skip 判定）
- `retries` — 任務內 reviewer 召喚重試總數

### Tagger-level record (emitted by hook + sweep)

```json
{
  "ts": "2026-04-21T12:34:56+00:00",
  "date": "2026-04-21",
  "outcome": "enqueued | tagged | skipped | failed",
  "file": "path/to/file.ts",
  "unit": "optional.symbol.name",
  "model": "haiku-4.5 | sonnet-4.6",
  "conf": 0.85,
  "tokens": 340
}
```

欄說：

- `outcome` — `enqueued`（鉤子登記）、`tagged`（sweep/tagger 完成）、`skipped`（whitespace-only、緩存命中等）、`failed`（tagger 錯誤）
- `unit` — sweep/tagger 填；鉤子階段無此欄
- `conf` — tagger 自評信心 0.0–1.0；<0.7 為低
- `tokens` — 單元標記 token 計

**關鍵**：`task_id` 欄**只**出現於 task-level 記錄；此為審計之唯一判別器。

## 錯誤與回退 (Error + fallback)

- 遙測檔絕對路徑不存在 → exit 2；stdout 印 `no telemetry data at <path>; run the pipeline on real tasks first`。
- 遙測檔存在但空 → exit 2；印 `telemetry empty`。
- 畸行比 > 10% → exit 3；印 `malformed telemetry detected: K/total lines invalid; inspect <path> or back up and truncate`。
- 配置檔 `.claude/rules/risk.md` 缺 → 使用默認（`.risk-pipeline/telemetry.jsonl`），於報告 Summary 註記「config not found, using defaults」。
- 零 task-level 記錄（只有 tagger） → 退出 0，emit tagger-only 報告；Summary 註「pipeline has not run any tasks; tagger-only analysis」。
- `--scope` 指定但 `queue.jsonl` 缺 → 警告並忽略 scope 過濾，繼執行。
- `--since` 解析失敗（非 ISO 亦非 `Nd` 格式） → exit 1；印 usage。

## 示例調用 (Invocation examples)

```text
# 默認：最近 50 任務
/risk-pipeline:audit

# 近百任務 JSON 輸出
/risk-pipeline:audit --last 100 --format json

# 過去 30 天，含 tagger 流
/risk-pipeline:audit --since 30d --include-tagger

# 僅 api 包，dry-run
/risk-pipeline:audit --scope "packages/api/**" --dry-run
```
