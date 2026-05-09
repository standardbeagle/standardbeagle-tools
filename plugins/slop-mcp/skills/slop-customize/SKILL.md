---
name: slop-mcp-slop-customize
description: "\"Interactive wrapper over the slop-mcp customize_tools meta-tool — set or remove tool description overrides, define or remove SLOP-backed custom tools, and list either bank by scope. 交互式包裝 customize_tools 元工具：設定或移除工具描述覆蓋、定義或移除 SLOP 複合工具、按範圍列出兩類條目。 Use when: shrinking a verbose third-party tool description, defining a project shortcut tool, listing what overrides or custom tools are active, removing a stale entry.\""
disable-model-invocation: true
---

# Customize MCP Tools

對 `customize_tools` 之命令級包裝。逐步引導用戶選擇子操作、收集必填字段、預填默認 `scope:"project"`，然後以驗證後參數調用元工具。覆蓋與自定義工具皆為 slop-mcp 內存層 `_slop.*` 保留條目 — **唯一寫路徑為 `customize_tools`**，禁直呼 `mem_save`。

## Tool Call

所有子操作共享同一入口：

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "<sub-action>"
  scope: "project"        # default; ask user to switch if needed
  ...action-specific fields...
```

## Sub-Action Selection

詢問用戶欲行何事，匹配下表之一：

| User intent 用戶意圖 | Sub-action | Required fields 必填字段 |
|----------------------|------------|--------------------------|
| 「縮減某工具描述」/ 「替換參數文檔」 | `set_override` | `mcp`, `tool`, `description` and/or `params` |
| 「移除某覆蓋」/ 「回復上游描述」 | `remove_override` | `mcp`, `tool` |
| 「列當前覆蓋」/ 「查陳舊覆蓋」 | `list_overrides` | （無，可選 `stale_only`、`mcp` 過濾） |
| 「定義新自定義工具」/ 「複合多 MCP 為一」 | `define_custom` | `name`, `description`, `inputSchema`, `body` |
| 「刪除某自定義工具」 | `remove_custom` | `name` |
| 「列當前自定義工具」 | `list_custom` | （無，可選 `mcp` 過濾） |
| 「導出當前範圍為包」 | `export` | （無，可選 `mcp` 過濾） |
| 「由包合入覆蓋與自定義工具」 | `import` | `data`（包之 JSON 字串），可選 `overwrite` |

若用戶未明示意圖，列上表並請其選一。

## Steps

### Step 0 — Verify Target (Precondition for `set_override` / `remove_override` / `define_custom`)

**對 `set_override` 與 `remove_override`**：用戶所稱之 `mcp`/`tool` 若本會話未經元工具確認，**先驗存在**：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

若 MCP 在列表，再取工具 schema：

```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
  mcp_name: "<mcp>"
  tool_name: "<tool>"
  verbose: true
```

`set_override` 之 `params` 鍵名須與 schema 鍵名一致；schema 中不存在之參數鍵應拒並提示用戶。

**對 `define_custom`**：若 `body` 內有 `execute_tool("<mcp>", "<tool>", ...)`，被調 MCP/工具同樣須經 `manage_mcps list` + `get_metadata verbose:true` 確認存在。憑記憶填 `execute_tool` 之被調工具名屬禁則。

未驗證即跳至 Step 1 為違規 — 詳見 `slop-mcp:discovery-first` 技能。

### Step 1 — Collect Required Fields

按所選 sub-action，逐字段詢問用戶。**默認 `scope:"project"`** — 顯示之並請用戶確認或改 `user`/`local`。

**`set_override`**：
1. `mcp` — MCP 服務器名（已 Step 0 驗證）。
2. `tool` — 工具名（已 Step 0 驗證）。
3. `description` —（可選）替換之描述文本。長散文宜壓至一兩句。
4. `params` —（可選）扁平映射 `{參數名: 替換描述}`。鍵名須匹配 schema；未列鍵之原描述保留。
5. `scope` — 默認 `project`，可改 `user`（個人跨項目）或 `local`（本機 gitignored）。

**`remove_override`**：
1. `mcp`, `tool` —（已 Step 0 驗證）。
2. `scope` — 默認 `project`。提醒用戶：移除後若低優先範圍另有覆蓋，其晉為生效。

**`list_overrides`**：
1. `scope` —（可選）若給定，僅列該範圍。省略則列當前生效合並結果。
2. `stale_only` —（可選 boolean）`true` 時僅返陳舊條目（上游 schema 已變者）。
3. `mcp` —（可選）按 MCP 名過濾。

**`define_custom`**：
1. `name` — 自定義工具名（出現於 `search_tools`，不可與已有 MCP 工具重名）。
2. `description` — 簡短描述（代理所見之主要文檔）。
3. `inputSchema` — JSON Schema 對象，至少 `type:"object"` 與 `properties`，必填字段列入 `required`。
4. `body` — SLOP 腳本字串。約束：無 `$` 前綴、`args["key"]` 訪問參數、`execute_tool(mcp, tool, args_map)` 調 MCP、64 KB 上限、16 幀遞歸（詳見 `slop-mcp:scripting` 技能）。
5. `scope` — 默認 `project`。

**`remove_custom`**：
1. `name` — 自定義工具名。
2. `scope` — 默認 `project`。

**`list_custom`**：
1. `scope` —（可選）默認當前生效合並。
2. `mcp` —（可選）按身體內所引 MCP 過濾。

**`export`**：
1. `scope` — 默認 `project`。
2. `mcp` —（可選）僅導與此 MCP 相關之覆蓋與自定義工具。
3. **後續**：響應之 `pack` 字段須以 `Write` 工具序列化至文件 — 通常 `.slop-mcp-packs/<mcp>.json`。本命令止於收得 `pack`；持久化見 `/slop-pack-export`。

**`import`**：
1. `data` — 包之 JSON 內容字串。通常以 `Read` 工具讀 `.slop-mcp-packs/<name>.json` 後傳入。
2. `scope` — 默認 `project`。包內 `scope` 字段不覆蓋此參數。
3. `overwrite` — 默認 `false`（同名條目保留現有）。`true` 為破壞性替換 — 改前宜先 `export` 備份。
4. **建議**：完整包導入流程見 `/slop-pack-import`。

### Step 2 — Confirm and Invoke

向用戶回放收集之字段（含 `scope`）求確認。確認後以全參數調 `customize_tools`：

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "<chosen>"
  scope: "project"
  ...collected fields...
```

### Step 3 — Present Result

顯示 `ok`、`affected`、以及操作特定字段（`overrides`/`custom_tools`/`pack`/`stale`）。`set_override` 與 `define_custom` 後提示用戶以 `/slop-search` 或 `get_metadata` 驗代理所見描述已更新。

## Examples

### Set override 設覆蓋

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "set_override"
  mcp: "figma"
  tool: "get_file"
  description: "Fetch a Figma document by file key. Returns page tree and node metadata."
  params: {
    "file_key": "Figma file key (last segment of share URL).",
    "depth": "Traversal depth (default 1)."
  }
  scope: "project"
```

### Define custom tool 定義自定義工具

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "define_custom"
  name: "figma_page_names"
  description: "List all page names in a Figma file."
  inputSchema: {
    "type": "object",
    "properties": {
      "file_key": {"type": "string", "description": "Figma file key"}
    },
    "required": ["file_key"]
  }
  body: "doc = execute_tool(\"figma\", \"get_file\", {file_key: args[\"file_key\"]})\nemit(pages: map(doc[\"pages\"], |p| p[\"name\"]))"
  scope: "project"
```

### List stale overrides 查陳舊覆蓋

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "list_overrides"
  stale_only: true
```

### Remove custom tool 刪除自定義工具

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "remove_custom"
  name: "figma_page_names"
  scope: "project"
```

## Forbidden 禁則

1. **直寫 `_slop.*` 內存** — `mem_save` / `mem_delete` / memory-cli 至 `_slop.overrides.json` 或 `_slop.tools.json` 鍵者遭服務器拒絕。一切覆蓋與自定義工具之變更**必經 `customize_tools`**。
2. **未驗 MCP/工具即 `set_override`** — Step 0 跳過則 `params` 鍵名極可能與 schema 不符；先 `get_metadata verbose:true`。
3. **未驗被調工具即 `define_custom` 含 `execute_tool(...)`** — 自定義身體中所引之 `<mcp>`/`<tool>` 同須會話內已驗證存在。
4. **猜 `inputSchema`** — `type`、`properties`、`required` 形狀錯誤則 slop-mcp 注冊時報錯。

違規恢復：停止 → 經元工具補驗 → 以驗證後字段重試。

## Related

- Invoke the `Skill` tool with `skill: slop-mcp:tool-customization` — 八操作完整語義、三範圍精度、自定義工具 9 條身體約束、保留 `_slop.*` 寫屏障、image-MCP 三階壓縮詳解。
- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — Step 0 之強制流程、禁則表、恢復路徑。
- Invoke the `Skill` tool with `skill: slop-mcp:scripting` — `body` SLOP 語法、`args` 訪問、`execute_tool` 從身體內調用、64 KB / 16 幀邊界。
- `/slop-pack-export` — 導出 `pack` 並 `Write` 至 `.slop-mcp-packs/<name>.json` 之完整命令。
- `/slop-pack-import` — `Read` `.slop-mcp-packs/<name>.json` 並調 `import` 之完整命令。
- `/slop-search` — 設覆蓋或定義自定義工具後，驗代理所見描述。
- `mcp-orchestrator` 代理 — Workflow 6「Customize Tool Descriptions」之協調者級調用。
