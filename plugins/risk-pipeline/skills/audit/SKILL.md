---
name: risk-pipeline-audit
description: "\"Audit risk-pipeline telemetry and emit calibration report. Usage: /risk-pipeline:audit [--last N] [--since DATE] [--format md|json]. Reports false-skip rate, over-review rate, token/time distributions, reviewer retry rates, tagger confidence drift. Recommends weight/budget tuning with confidence-scored priority.\""
disable-model-invocation: true
---

# /risk-pipeline:audit

## 概覽 (Overview)

此命令為 `risk-telemetry-audit` 技藝之薄殼。既管道日久積遙測，須回檢：低分任務有無漏審真 bug？高分審無所獲？token 離群幾何？此命令解旗標、召技藝、陳報，人據以調 `weights`/`scalar_max`/`model`。**勿自改配置** — 唯陳議，人斷之。

## Usage examples

```
/risk-pipeline:audit                              # last 50 tasks
/risk-pipeline:audit --last 100                   # last 100 task-level records
/risk-pipeline:audit --since 2026-01-01           # from date (ISO)
/risk-pipeline:audit --since 30d                  # last 30 days
/risk-pipeline:audit --format json                # JSON output (machine-readable)
/risk-pipeline:audit --include-tagger             # also analyze tagger-level stream
/risk-pipeline:audit --scope "packages/api/**"    # filter by touched-file glob
/risk-pipeline:audit --threshold-drift 0.2        # stricter axis-drift flag
/risk-pipeline:audit --dry-run                    # compute + print; no disk write
```

## Output

報告落於 `.risk-pipeline/audit-reports/<ISO>.md`（或 `.json`）。stdout 印絕對路徑（md）或全文（json）。`--dry-run` 則僅 stdout，不寫檔。

## 執行 (Instructions)

召 `risk-telemetry-audit` 技藝，透傳旗標，並格式化呈現：

1. 解析 `$ARGUMENTS` 旗標（長名規範；未指定則用默認 `--last 50`）。
2. 呼 `risk-telemetry-audit` 技藝。
3. 技藝返後，依退出碼分支：
   - `0` → 印綠字確認並開報告路徑提示（`.risk-pipeline/audit-reports/<ISO>.md`）。
   - `2` → 印黃字「遙測無數據」並提示：先跑幾個真實任務以積數據，再回審計。
   - `3` → 印紅字「遙測有畸行」並附檔路徑與畸行比，指示檢查寫入端。
4. 若 `--format md` 且非 `--dry-run`，於終端印報告首 40 行為預覽，餘以路徑指示。

## Frequency recommendation

- 管道發展期（前 3 月）：**每週**一審，以快速校準權數與模型分配。
- 穩定運行後：**每月**或每季一審，視任務量而定（少於 50 任務/月則延至季）。
- 重大配置變更後：強制即審，以立新基線（`.risk-pipeline/audit-reports/` 保留歷史報告即歷史基線）。

## Interpretation

讀報時三問為要：

1. **False-skip > 10%** → 輕管道放行了真 bug。議：降 `scalar_max` 或升主導軸權。此號示「太鬆」。
2. **Over-review > 30%** → 高分審之徒勞。議：升 `scalar_max` 或降主導軸權。此號示「太緊」。
3. **Reviewer retry > 20% 於某 agent** → 該 agent prompt 不穩。議：重審該 agent 文案；A/B 比對有無該 reviewer 之結果。

建議按優先級排序；**high** 優先者值得當週行動，**low** 優先者留至下次批量調整。信心欄示樣本規模足否 — `low` 信心之議需多積數據方可執行。

## 依賴 (Dependencies)

- `.risk-pipeline/telemetry.jsonl` 存在且含至少一 task-level 記錄（有 `task_id` 欄）。無則技藝返碼 2。
- `.claude/rules/risk.md` 有 `risk_pipeline.telemetry` 段（自 `/dev-standards:setup-project` 生成）；缺則用內建默認，Summary 會註明。
- 可選：`.risk-pipeline/queue.jsonl` — `--scope` 過濾需此以交叉 task_id → files。

## 後續 (After running)

- **審議配置**：依報告 Recommendations 段手動編輯 `.claude/rules/risk.md`；每次改動一項，待下一輪審計驗證方向。
- **重標低信心單元**：若 tagger-conf 段建議，跑 `/risk-pipeline:tag-sweep --force --scope <paths>`。
- **修 reviewer agent**：若某 reviewer 重試率高，編該 agent 文案於 `plugins/risk-pipeline/agents/<name>.md`。
- **保留歷史報告**：`.risk-pipeline/audit-reports/` 勿入 `.gitignore`——歷史基線有價，團隊可見趨勢。

此命令**只讀不改**。所有配置變更皆需人手執行，留審計追溯。
