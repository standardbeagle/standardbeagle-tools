---
name: risk-pipeline-risk-tag-sweep
description: "Backfill @risk tags across a codebase. Enumerates untagged (or stale, or all with --force) symbols via LCI, drains hook queue, processes in 10-wide parallel batches invoking risk-tag-unit per symbol. Progress + resumable checkpoints to .risk-pipeline/sweep-state.json. Supports --scope glob narrowing and --force re-tag. Safe for monorepos via per-package scoping."
disable-model-invocation: true
context: fork
agent: general-purpose
---

<!-- CC 2.1 fork decision: workflow driver — bulk LLM tagging across thousands of symbols, 10-wide parallel batches, multi-phase (enumerate → drain queue → batch tag → checkpoint). Forking keeps the orchestrator free of per-symbol tag-unit chatter; parent sees only final JSON summary. Executor: general-purpose (no specialist agent needed; this skill drives sub-skill invocations not domain reasoning). -->


# risk-tag-sweep

## 概覽 (Overview)

碼庫級補標。觸發時機三：項目首次啟風險管道（bootstrap）、結構升級（schema bump）、鉤子排隊積壓待清。輸入：旗標可選；輸出：stdout 末尾一 JSON 摘要，stderr 進度。失敗可續，狀態存 `.risk-pipeline/sweep-state.json`。呼叫方：人通過 `/risk-pipeline:tag-sweep`，或 LLM 於 bootstrap 階段直呼此技藝。

## 調用路徑 (Invocation modes)

三路可入：

- **命令驅動**：`/risk-pipeline:tag-sweep [flags]` — 人主導，常態。
- **LLM 直呼**：循環協調或 bootstrap 階段召本技藝，傳同等旗標。
- **自動排隊**：先讀 `.risk-pipeline/queue.jsonl`（鉤子積壓），再依未標枚舉。`--queue-only` 則僅清隊列。

## 旗標 (Flags)

全旗標表（長名為規範，短名為便）：

| Flag | Arg | Effect |
|------|-----|--------|
| `--scope` | glob (e.g. `src/**/*.ts`) | Narrow enumeration to matching files |
| `--force` | — | Re-tag already-tagged units (schema upgrade) |
| `--queue-only` | — | Only drain `.risk-pipeline/queue.jsonl`; skip untagged enumeration |
| `--dry-run` | — | List what would be tagged; no LLM calls |
| `--batch-size` | int (default 10) | Parallelism width |
| `--max-units` | int | Hard cap per invocation (daily cap honored independently) |
| `--resume` | — | Resume from `.risk-pipeline/sweep-state.json` without prompt |

## 管道 (Pipeline)

八步依序：

1. 檢 `.risk-pipeline/sweep-state.json` 存否。存且 `--resume`（或交互提示同意）→ 載入；否則初新態。
2. 若 `queue.jsonl` 存且非空：取其條目為工作列首批（hook 排隊者優先）。
3. 枚舉未標（或 staled，或 `--force` 下全部）公開單元。LCI 查 `mcp__plugin_lci_lci__search` + 交叉 `@risk` 存否。
4. 若 `--scope` 供：以 glob 過濾枚舉結果。不符者丟。
5. 分批：工作列按 `batch_size`（默 10）切片；記 `total_units`、`batch_count`。
6. 逐批並發：各批內 10 單元齊呼 `risk-tag-unit`；批內全畢方進下批（無滑窗，求檢查點原子）。每單元完即更新狀態檔。
7. 每批完檢 `daily_tag_cap`。越限 → 持久化狀態，清退出，印「resume later」。
8. 末尾：stdout 發 JSON 摘要（見 §輸出）；stderr 印總結行。

## 狀態文件 (sweep-state.json schema)

狀態格式，十欄俱全：

```json
{
  "started_at": "2026-04-21T10:30:00-05:00",
  "scope": "src/**/*.ts",
  "force": false,
  "batch_size": 10,
  "total_units": 1234,
  "processed_units": 456,
  "current_batch": 45,
  "tagged": 410,
  "skipped": 42,
  "failed": 4,
  "last_unit": {"file": "src/auth/login.ts", "unit_name": "loginWithPassword"},
  "remaining": ["src/auth/logout.ts#handleLogout", "src/api/user.ts#getProfile"]
}
```

`scope: null` 表無限縮；`remaining` 存「unit_id」串（`<file>#<unit_name>`）以便續傳重建工作列。

## 並發 (Concurrency)

十寬並發，與鉤子（Phase 04）共用同套檔級鎖：

- 鎖位：`.risk-pipeline/locks/<sha256(file)[0:16]>.lock`。
- 鉤子同時觸發 → 鉤子讓 sweep（讀鎖在握即排隊退出），sweep 勝。
- 陳鎖 60 秒逾 → 可奪（`mtime > 60s`）。
- 批內 10 並發齊跑，全畢才進下批。滑窗廢棄：求每批後狀態檔可原子更新。

## 續傳 (Resume)

重啟邏輯四條：

- 見 `sweep-state.json` 存且 `remaining` 非空 → 可續。
- `--resume` 旗標：徑直續；不問。
- 交互模式無旗標：提示「resume or discard?」，用戶選。
- 狀態檔 schema 版不合（欄缺或類型異）→ 備份為 `.risk-pipeline/sweep-state.json.bad`，始新態，印警示。

## 範疇限縮 (Scope narrowing)

`--scope` 取 glob，匹配相對項目根之路徑。例：

- `"src/auth/**/*.ts"` — 一包；單登錄/授權模組掃標。
- `"packages/api/**"` — monorepo 子樹；分包推進，便增量。
- 否定 `"!vendor/**"`：若底層 LCI 支持則用；不支持則本技藝不自行實作，記限制於輸出 `warnings`。

monorepo 推薦：先 `--scope "packages/core/**"`，續 `"packages/web/**"`，分批不一次全掃。

## 強制重標 (--force)

用途三：

- Schema 版遷（碼文塊格式變，需重刷）。
- 權重校準（軸計算改，需重評所有單元）。
- 模型升級（haiku 新版、sonnet-4.7 等，願受惠則重跑）。

行為：丟既有 `@risk` 諸行後重標（保其他 docblock 內容如 param、return）。非 `--dry-run` 時啟動前印警示並等 5 秒，避誤觸。`telemetry.jsonl` 記 `force:true`。

## 進度報告 (Progress reporting)

stderr 每批末一行，機可讀不拘格式：

```
[sweep] batch 45/124  |  tagged 410  skipped 42  failed 4  |  ETA 3m 20s
```

ETA 由「已歷時間 / 處理單元數 × 剩餘單元數」估。stdout 保留予末尾 JSON 摘要（管道可消費）。日誌副本至 `.risk-pipeline/sweep.log`（行同，加時戳）。

## 錯誤與回退 (Error + fallback)

四失敗態：

- **LCI 不可得**：中止；狀態檔保留；stderr 印明示「index missing — run /lci:reindex」；返 `outcome:aborted`。
- **`risk-tag-unit` 單元失敗**：計入 `failed` 欄，批內續跑其他單元；錯因入 `sweep.log`。
- **狀態檔壞**：備份至 `.bad`，始新態；stderr 印警示。
- **日上限到**：淨退出，持久化狀態；`outcome:partial`，`next_action:resume`。

## 輸出 (Final output)

stdout 末尾一 JSON（機可讀，六欄）：

```json
{
  "outcome": "complete | partial | aborted",
  "total_units": 1234,
  "tagged": 1150,
  "skipped": 70,
  "failed": 14,
  "duration_sec": 840,
  "next_action": "done | resume | manual_review"
}
```

`next_action:resume` 時附 hint：「re-run with `--resume`」；`manual_review` 時指向 `sweep.log` 查失敗。
