---
name: risk-tag-unit
description: "Tag one code unit with @risk vector. Reads unit body + imports + LCI 2-level call graph, asks haiku-4.5 for JSON risk vector, escalates to sonnet-4.6 when conf<0.7 or any axis=3, writes ASCII glyph @risk block into unit's codedoc."
---

# risk-tag-unit

## 總覽 (Overview)

單元級風險標註。輸入單元位次，出 `@risk` 五軸向量，寫入單元碼文塊。`haiku-4.5` 主，信心低或軸臨界則升 `sonnet-4.6`。呼叫方：`PostToolUse` 鉤、`risk-tag-sweep` 技藝、`risk-classify` 之惰性標註。碼文塊式見 `rules/risk-pipeline/codedoc-schema.md`。

## 輸入 (Inputs)

呼叫方必供：

- `file_path` — 絕對路徑
- `line_range` — `[start, end]`，單元體之行範圍
- `unit_name` — 符號名，日誌與鎖鍵用
- `language` — `ts|js|py|go|rust|csharp|fsharp|ruby`；缺則由副檔名推

## 管道 (Pipeline)

八步依序執行：

1. **讀體**：`file_path[start:end]` 取單元體。
2. **讀導入**：同檔頂部 import/use/require 段。
3. **調用圖**：`mcp__plugin_lci_lci__get_context`，2 層深，callers + callees，僅名稱（截至各 8 條）。
4. **域術語**：若有 `DOMAIN.md`，擷單元體中出現之術語定義片段（LCI search 或 ripgrep 單元體關鍵詞）。
5. **主模型**：`haiku-4.5` 以下提示模板入，嚴 JSON 出 `{b,d,s,r,u,conf,why}`。
6. **升級判**：`conf < 0.7` 或任一軸 `= 3` → `sonnet-4.6` 重跑同提示，留高信心答（升級表見下）。
7. **渲染**：JSON → ASCII glyph 碼文塊，位順 `b→d→s→r→u`，字符 `. - + !`，附 `tagged: model: conf:`，`!` 軸則加 `@risk-why`。
8. **寫檔**：`Edit` 插入或更新單元 docblock 之 `@risk` 行；保既有內容（參數說明、返回、其他標籤）。

## 提示 (Prompt template)

主副模型同提示，字字不易：

```
You classify code risk across 5 axes. Output ONLY JSON.

Axes (0=low, 1=med, 2=high, 3=crit):
  b (blast): how many callers/consumers affected if this breaks
  d (data): risk to persistent/external data
  s (security): auth, crypto, authz, input validation, secrets
  r (reversibility): harder to undo (shipped artifacts, destructive ops)
  u (unknowns): novel patterns, no test coverage, unfamiliar API usage

Output: {"b":N,"d":N,"s":N,"r":N,"u":N,"conf":0.0-1.0,"why":"<=140 chars"}

UNIT:
<body>

IMPORTS: <list>
CALLERS (up to 8): <names>
CALLEES (up to 8): <names>
DOMAIN TERMS: <extracted>
```

`<body> <list> <names> <extracted>` 由管道第 1–4 步填入。

## 升級 (Escalation)

主模型 `haiku-4.5` 出後評：

| Trigger | Action |
|---------|--------|
| `conf < 0.7` | `sonnet-4.6` 重跑 |
| 任一軸 `= 3` | `sonnet-4.6` 重跑 |
| 兩模型於 `crit` 軸不合 | 留 `sonnet-4.6` 答 |
| 兩模型皆 `conf >= 0.7` 且無 `crit` 軸 | 留 `haiku-4.5` 答（無需升級） |
| 升級後 `sonnet-4.6` 仍 `conf < 0.7` | 留 `sonnet-4.6` 答，記 `conf` 如實 |

`model:` 欄記最終採用者。

## 語言出符 (Language-specific output)

六語言標位如下；欄名一致，語法異：

| Language | Syntax | 示例標位 |
|----------|--------|---------|
| TS / JS | JSDoc `/** */` above unit | `* @risk b+d.s!r-u.` |
| Python | docstring first line `@risk:` section | `    @risk: b+d.s!r-u.` |
| Go | `//` doc comment block above decl | `// @risk b+d.s!r-u.` |
| Rust | `///` doc comment above item | `/// @risk b+d.s!r-u.` |
| C# / F# | XML `<risk>` element in `///` block | `/// <risk>b+d.s!r-u.</risk>` |
| Ruby | YARD `@risk` tag in `#` block | `# @risk b+d.s!r-u.` |

主行後續次行 `tagged:YYYY-MM-DD model:<name> conf:N.NN`；`!` 軸則 `@risk-why "..."` 續行。

## 錯誤 (Errors)

三失敗模態，行止如下：

- **主模型回無效 JSON**：重試一次同提示。二次仍無效 → 跳該單元不寫檔，返回 caller `status:failed reason:invalid-json`，單元於後續 `risk-classify` 認作 `unknowns:high`（記憶體態，非寫入）。
- **`Edit` 衝突**（檔於中途被改）：重讀 `file_path[start:end]` 一次，重套變更。二次仍衝突 → 返回 `status:failed reason:edit-conflict`。
- **標註模型不可得**（API 錯、超時、額度用盡）：悲觀備援，輸出 `{b:2,d:2,s:2,r:2,u:3,conf:0.3,why:"tagger unavailable"}`，`model:` 記 `fallback`；管道續行，呼叫方依 `u:3` 知高不確。

## 並發 (Concurrency)

- 檔級鎖：`.risk-pipeline/locks/<file-hash>.lock`，hash 為 `file_path` 之 sha1。
- 取鎖前檢存鎖 mtime：`> 60s` 則視為 stale，可強奪。
- 鉤子遇 sweep 持鎖則排隊，sweep 勝；sweep 完釋鎖後鉤子續。
- 鎖體含持者 pid、unit_name、start_time，供診斷。

## 成本 (Cost controls)

- **體哈希跳過**：單元體 sha256（去前後空白、規範換行後算）不變則跳過，不呼模型。哈希存於 `@risk` 旁 `bodyhash:` 欄或 `.risk-pipeline/tag-cache.json`。
- **日上限**：`daily_tag_cap` 默 500 單元/日。越限則本次呼叫返 `status:skipped reason:daily-cap`，延至 `risk-tag-sweep` 批處理。
- **遙測**：每次模型調用追加一行 JSON 至 `.risk-pipeline/telemetry.jsonl`，欄：`ts, file, unit, model, tokens_in, tokens_out, body_bytes, conf, escalated`。

## 輸出 (Output contract)

技藝返呼叫方：

```json
{
  "status": "tagged | skipped | failed",
  "model_used": "haiku-4.5 | sonnet-4.6 | fallback",
  "risk_vector": {"b":N,"d":N,"s":N,"r":N,"u":N,"conf":0.NN,"why":"..."},
  "file_edited": true,
  "reason": null
}
```

- `status:tagged` → `file_edited:true`，`risk_vector` 具。
- `status:skipped` → `reason` 記因（`body-unchanged | daily-cap | unsupported-language`），`file_edited:false`。
- `status:failed` → `reason` 記因（`invalid-json | edit-conflict | tagger-unavailable-hard`），`file_edited:false`，呼叫方決是否重排。
