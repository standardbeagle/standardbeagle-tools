---
name: risk-pipeline-tag-sweep
description: "\"Backfill @risk tags across the codebase. Invokes risk-tag-sweep skill with supplied flags. Use --scope to narrow, --force to re-tag, --dry-run to preview. Resumable via --resume.\""
disable-model-invocation: true
---

# /risk-pipeline:tag-sweep

## 概覽 (Overview)

此命令為 `risk-tag-sweep` 技藝之薄殼。解析用戶旗標，召技藝，待返果。適用於：項目首次 bootstrap、schema 升級重標、手動清鉤子隊列。Monorepo 推薦 `--scope` 分包逐掃，避一次過巨。

## Usage examples

```
/risk-pipeline:tag-sweep                              # full sweep
/risk-pipeline:tag-sweep --scope "src/**/*.ts"         # narrow to TS under src/
/risk-pipeline:tag-sweep --dry-run                    # preview without LLM calls
/risk-pipeline:tag-sweep --force                      # re-tag every unit
/risk-pipeline:tag-sweep --resume                     # continue a prior sweep
/risk-pipeline:tag-sweep --queue-only                 # drain hook queue only
/risk-pipeline:tag-sweep --scope "packages/api/**" --batch-size 5
```

## 預檢 (Before running)

啟前三驗：

- LCI 索引鮮：如久未更，先跑 `/lci:reindex`。無索引則技藝即棄。
- `.claude/rules/risk.md` 已立：缺則 `risk-classify` 返 `enabled:false`，本 sweep 無用。以 `/dev-standards:setup-project` 補。
- monorepo 專案：勿一發即全掃；分包 `--scope` 逐進為宜，控成本。

## 執行 (Instructions)

召 `risk-tag-sweep` 技藝並傳透用戶所給之旗標：

1. 解析用戶自 `$ARGUMENTS` 之旗標（長名規範；短名兼）。
2. 若旗標空 → 告用戶將作「全掃」，印估算（LCI 單元數 × 0.3–0.8 分/千）並等確認；`--yes` 則徑行。
3. 呼 `risk-tag-sweep` 技藝，透傳旗標。
4. 實時轉發 stderr 至用戶終端（進度行）。
5. 技藝返後解析 stdout JSON，依 `outcome` 分支顯示：
   - `complete` → 印綠字摘要並指示 `.risk-pipeline/telemetry.jsonl` 查成本。
   - `partial` → 印黃字，告「re-run with `--resume`」。
   - `aborted` → 印紅字，附 `sweep.log` 末 20 行以供診斷。

## 後續 (After running)

果在何處：

- **狀態檔**：`.risk-pipeline/sweep-state.json` — 續傳源，成功可刪。
- **遙測**：`.risk-pipeline/telemetry.jsonl` — 每單元一行，含 token、model、成本。
- **日誌**：`.risk-pipeline/sweep.log` — 失敗詳情與時序。
- **鎖目錄**：`.risk-pipeline/locks/` — 正常情況自清；異常退出可留陳鎖，下次自奪。

末校：sweep 完再跑一次 `--dry-run` 驗無殘留未標單元。
