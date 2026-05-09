---
name: slop-mcp-slop-pack-import
description: "\"Import a slop-mcp customization pack from `.slop-mcp-packs/<name>.json` into a chosen scope, merging by default or replacing when explicitly requested. 由 `.slop-mcp-packs/<name>.json` 將 slop-mcp 定制包導入指定範圍：默認合並，顯式請求方替換。 Use when: applying a teammate's shared customization pack after `git pull`, restoring overrides + custom tools from a pre-upgrade backup, moving customizations between machines, onboarding to a new repository that ships `.slop-mcp-packs/`.\""
disable-model-invocation: true
---

# Import Customization Pack

對 `customize_tools action:"import"` 之命令級包裝。本命令引導用戶：發現包文件、驗其形狀、可選備份當前狀態、選範圍與覆蓋語義、調元工具、再驗陳舊。slop-mcp 服務器**不直接讀盤** — 包文件之 I/O 全在代理之 `Glob` + `Read` 工具，元工具僅接受 JSON 字符串為 `data` 參數。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "import"
  data: "<full JSON contents of pack file as a string>"
  scope: "project"        # default; ask user to switch if needed
  overwrite: false        # default; confirm before flipping to true
```

## Steps

### Step 0 — Discover Pack File (Precondition)

**發現先於變更**。若用戶未給顯式路徑，以 `Glob` 列出本倉所有包：

```
Glob
  pattern: ".slop-mcp-packs/*.json"
```

若返多文件，向用戶呈列並請其選一。若返空，停止 — 倉內無包可導，問用戶是否誤倉、是否需 `git pull`、或是否自他路徑導入（如 `~/Downloads/team-baseline.json`）。

未先發現即憑記憶填路徑為違規 — 詳見 `slop-mcp:discovery-first` 技能。憑「應該叫 figma.json」之猜測讀文件，極可能讀錯文件或文件不存在而誤導後續步驟。

### Step 1 — Read and Sanity-Check Pack Shape

以 `Read` 工具讀所選文件全內容：

```
Read
  file_path: "<repo>/.slop-mcp-packs/<name>.json"
```

讀畢驗其形狀。合法包之頂層形如：

```json
{
  "schema_version": 1,
  "scope": "project",
  "overrides": [...],
  "custom_tools": [...]
}
```

**驗證點**：

1. **`schema_version === 1`** — 若非 1（或字段缺失），停止並問用戶。導入未知 schema 版可能行為未定義。
2. **頂層首鍵為 `schema_version`，非 `ok`** — 若包以 `{ "ok": true, "action": "export", "affected": N, "pack": {...} }` 開頭，則導出方誤寫整個響應對象而非 `pack` 字段；本包不可直接導入，須先重提取 `pack` 並重寫文件，或請導出方重新運行 `/slop-pack-export`。
3. **清點條目並複述**：「將導入 N 條覆蓋、M 個自定義工具，目標 MCP 名：figma、github。」令用戶有機會於導入前發現意外。

### Step 2 — Backup Before Import (Rollback Safety, Recommended)

**slop-mcp 無自動回滾**。導入後若覆蓋與本地既有定制衝突，唯靠預先備份還原。對 `project` 與 `user` 範圍，導入前宜先導當前狀態為備份包：

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"        # match the target scope of the upcoming import
```

響應 `pack` 字段以 `Write` 寫至 `.slop-mcp-packs/backup-<timestamp>.json`：

```
Write
  file_path: "<repo>/.slop-mcp-packs/backup-20260417-2120.json"
  content: <JSON.stringify(response.pack, null, 2)>
```

需回滾時將此備份作為 `/slop-pack-import` 之輸入，配 `overwrite: true` 即可還原至備份時刻之狀態。

對 `local` 範圍且本機尚無定制者，可跳此步 — 無物可備份。然 `overwrite: true` 配合任一範圍仍宜先備份。

### Step 3 — Choose Scope and Overwrite Semantics

向用戶確認兩參數：

**`scope`** — 默認 `project`：

| Scope | When | Path |
|-------|------|------|
| `project` | 團隊共享，入 git。**默認** | `<repo>/.slop-mcp/memory/_slop/` |
| `user` | 個人全局，跨項目 | `~/.config/slop-mcp/memory/_slop/` |
| `local` | 本機個人，gitignored | `<repo>/.slop-mcp/memory.local/_slop/` |

**重要**：包內 `scope` 字段**不**覆蓋此參數 — 用戶選擇之 `scope` 即生效範圍。導出於 `project` 之包可導入至 `user` 域作個人版，反之亦然。

**`overwrite`** — 默認 `false`：

| Value | Semantics 語義 |
|-------|---------------|
| `false`（默認）| **合並** — 同名條目（同 `mcp+tool` 之覆蓋、同 `name` 之自定義工具）保留現有，新條目添加。安全默認。 |
| `true` | **替換** — 同名條目以包內版覆蓋本地版。**破壞性** — 用戶現有定制將被丟棄。僅用戶明示且 Step 2 已備份時用之。 |

**確認**：「將以 `scope: project` + `overwrite: false`（合並）導入。如需替換現有定制請改為 `overwrite: true`。」用戶說 `true` 時**回查 Step 2 備份是否已做** — 未備份則停止並先備份。

### Step 4 — Invoke Import

確認後以 Read 所得字符串內容傳入 `data`：

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "import"
  data: "<raw JSON string from Step 1 Read>"
  scope: "project"
  overwrite: false
```

`data` 為**包之 JSON 字符串**（含 `schema_version` / `scope` / `overrides` / `custom_tools`），非文件路徑、非響應信封。直接傳 Read 返回之文件內容即可。

響應形如：

```json
{
  "ok": true,
  "action": "import",
  "affected": 5,
  "imported": {
    "overrides": 4,
    "custom_tools": 1
  },
  "skipped": 0
}
```

`overwrite: false` 時 `skipped` 為已存而被跳過之同名條目數。`affected` 為實際合入之新條目數。`affected: 0` 與 `skipped > 0` 表所有條目均已存 — 此為合並之預期，非錯誤。

### Step 5 — Post-Import Staleness Check

導入時 schema 哈希原樣保留 — 若本機 MCP 版本與包源版本不同，導入之覆蓋或即顯 `stale: true`。覆蓋仍生效，但其描述可能基於舊 schema 而誤導代理。立即查陳舊：

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "list_overrides"
  stale_only: true
```

或捷徑：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list_stale_overrides"
```

對陳舊者以 `/slop-customize` 之 `set_override` 重寫為新 schema，或 `remove_override` 清除回復上游描述。

## Examples

### Standard merge import 標準合並導入

隊友 `git pull` 後，對新增之 `figma.json` 包執標準合並導入：

```
# Step 0 — discover
Glob
  pattern: ".slop-mcp-packs/*.json"

# Step 1 — read and verify
Read
  file_path: "<repo>/.slop-mcp-packs/figma.json"
# verify first key is "schema_version", count entries

# Step 2 — backup current project scope (recommended)
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"

Write
  file_path: "<repo>/.slop-mcp-packs/backup-20260417-2120.json"
  content: <JSON.stringify(response.pack, null, 2)>

# Step 4 — import (default merge)
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "import"
  data: "<raw contents of figma.json>"
  scope: "project"
  overwrite: false

# Step 5 — staleness check
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list_stale_overrides"
```

### Forced overwrite import 強制替換導入

用戶明示欲以包內版替換本地全部現有定制（如統一團隊基線）：

```
# Step 2 — backup is MANDATORY before overwrite:true
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"

Write
  file_path: "<repo>/.slop-mcp-packs/backup-pre-baseline-import.json"
  content: <JSON.stringify(response.pack, null, 2)>

# Step 4 — overwrite:true replaces all same-key entries
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "import"
  data: "<raw contents of team-baseline.json>"
  scope: "project"
  overwrite: true
```

回滾路徑：將 `backup-pre-baseline-import.json` 作為 `data` 配 `overwrite: true` 重導即可還原。

### Restore from pre-upgrade backup 由升級前備份還原

升級上游 MCP 包後覆蓋全標陳舊，欲回滾至升級前狀態：

```
# Step 0 — locate the backup pack
Glob
  pattern: ".slop-mcp-packs/backup-imagegen-pre-v2.json"

# Step 1 — read + verify
Read
  file_path: "<repo>/.slop-mcp-packs/backup-imagegen-pre-v2.json"

# Step 4 — overwrite to discard the now-stale post-upgrade overrides
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "import"
  data: "<raw contents of backup-imagegen-pre-v2.json>"
  scope: "project"
  overwrite: true
```

備份本身已為導入前狀態之快照，故 Step 2 之預備份可省。

## Forbidden 禁則

1. **傳文件路徑為 `data` 而非文件內容** — `data: ".slop-mcp-packs/figma.json"` 之類傳路徑串將被服務器作為（無效）JSON 解析而拒。`data` 必為 `Read` 工具所返之**實際文件內容字符串**（含 `schema_version` 等鍵之完整 JSON 文本）。
2. **`overwrite: true` 而未經 Step 2 備份** — 替換為破壞性，無自動回滾。未先導出當前狀態即翻 `overwrite: true` 將永久丟失本地既有定制。Step 2 對 `overwrite: true` 不可省。
3. **跳過 Step 1 之 schema 驗證直接 import** — 若包以 `{ "ok": true, ..., "pack": {...} }` 為頂層（導出方誤寫整響應），則 `data` 之首鍵錯誤，import 行為未定義或直接拒。Step 1 驗 `schema_version === 1` 為頂層首鍵之必要關卡。
4. **以 Bash heredoc / cat 管道注入 `data`** — `cat figma.json | mcp__... customize_tools` 之類繞 `Read` 工具之路徑將跳 PostToolUse 鉤子並可能引入 shell 轉義錯誤令 JSON 損壞。一切讀取經 `Read`，一切調用經元工具直調。
5. **未發現即憑記憶讀文件** — 跳 Step 0 之 `Glob`，憑「上次叫 figma.json」之猜測 `Read` 不存在文件或讀錯倉之同名包，導致導入錯誤定制至錯誤倉。發現先於變更為 slop-mcp 律令 — 詳見 `slop-mcp:discovery-first`。

違規恢復：停止 → 補 Step 0 `Glob` 或 Step 2 備份 → 以驗證後參數重發 `customize_tools import`。

## Related

- Invoke the `Skill` tool with `skill: slop-mcp:tool-customization` — 八操作完整語義、`import` 之 `data` 字段格式、`overwrite` 合並 vs 替換之底層行為、三範圍精度、保留 `_slop.*` 寫屏障、陳舊覆蓋之 schema 哈希語義。
- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — Step 0 強制 `Glob` 流程、未發現即讀之禁則、恢復路徑。
- `/slop-pack-export` — 兄弟命令，將 `customize_tools action:"export"` 之 `pack` 字段寫至 `.slop-mcp-packs/<name>.json`；本命令所讀之文件即彼所寫。導出/導入合為團隊共享之完整環。
- `/slop-customize` — 交互式包裝 `customize_tools` 八操作；本命令為其 `import` 子操作之專用快徑（含 `Glob` 發現、Read、預備份、陳舊復查）。
- `migration-assistant` 代理 — 第二遷移軸「Migrate Customization Packs」涵蓋同流程之代理級協調，含批量發現多包、對每包重複本流程、合併報告。
- `mcp-orchestrator` 代理 — Workflow 6「Customize Tool Descriptions」涵蓋 `customize_tools` 全 8 操作之協調者級調用，包括導出/導入流程。
