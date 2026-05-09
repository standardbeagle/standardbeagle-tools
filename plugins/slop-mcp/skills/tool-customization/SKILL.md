---
name: slop-mcp-tool-customization
description: "Override verbose third-party MCP tool descriptions, define composite SLOP-backed custom tools, share customization packs via git. 壓縮工具描述、定義複合工具、經 git 共享。 Use when: override tool description, shrink tool docs, define custom tool, compose MCP tools, share customizations, stale override, export/import customization pack."
disable-model-invocation: true
---

# Tool Customization

第三方 MCP 所附工具描述常為人類而書，非為代理而書。單一 `get_file` 描述或耗 400 token 之散文與注意事項，乘以十餘工具則上下文預算頃刻耗盡。此定制層令汝不改上游源代碼，僅替換代理所見之描述與參數文檔，亦可以 SLOP 腳本定義全新複合工具。

所有操作經 `customize_tools` 元工具完成。上游工具 schema 與行為不變 — 唯代理可見之描述文本替換。定制以三層範圍存儲，可導出為可攜包並經 git 分發予團隊。

## Core Tool

`mcp__plugin_slop-mcp_slop-mcp__customize_tools` 為定制層唯一入口。其 `action` 參數分八路：

| Action | Purpose |
|--------|---------|
| `set_override` | 替換既存 MCP 工具之描述或參數文檔 |
| `remove_override` | 移除指定範圍之覆蓋，回復上游描述 |
| `list_overrides` | 列所有覆蓋，可 `stale_only:true` 過濾陳舊者 |
| `define_custom` | 定義全新 SLOP 複合工具，暴露於 `search_tools` |
| `remove_custom` | 刪除已定義之自定義工具 |
| `list_custom` | 列當前範圍內所有自定義工具 |
| `export` | 序列化當前範圍覆蓋 + 自定義工具為 JSON 包 |
| `import` | 由 JSON 包合入覆蓋與自定義工具 |

## Scopes

覆蓋與自定義工具存於三域，高優先域遮蔽低優先域。上游 MCP 原工具永不變動。

| Scope | Directory | Commit? |
|-------|-----------|---------|
| `user` | `~/.config/slop-mcp/memory/_slop/` | No — personal |
| `project` | `<repo>/.slop-mcp/memory/_slop/` | Yes — team-shared |
| `local` | `<repo>/.slop-mcp/memory.local/_slop/` | No — gitignored |

每範圍含兩文件：`_slop.overrides.json`（覆蓋索引）與 `_slop.tools.json`（自定義工具索引）。

**Precedence 優先序**：`local > project > user`。同一工具於多域有覆蓋時，最高優先域生效。省略 `scope` 參數時默認 `user`。

## Overrides

覆蓋替換 `search_tools` 與 `get_metadata` 所返之描述與參數文檔 — 底層 schema 與執行行為不受影響。

### Set Override

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "set_override"
  mcp: "figma"
  tool: "get_file"
  description: "Fetch a Figma document by file key. Returns page tree and node metadata."
  params: {
    "file_key": "Figma file key (last path segment of the Figma URL)",
    "depth": "Node traversal depth (default 1; increase for deeper component trees)"
  }
  scope: "project"
```

`params` 為扁平映射：參數名 → 替換描述。略去某參數則保留上游原描述。代理所見工具 schema 仍為上游完整 schema — 僅描述性文本替換。

### Remove Override

```json
{
  "action": "remove_override",
  "mcp": "figma",
  "tool": "get_file",
  "scope": "project"
}
```

移除後該範圍回復上游描述；若低優先範圍另有覆蓋，則其晉為生效。

## Custom Tools

自定義工具為汝從零定義之全新工具，出現於 `search_tools` 結果中與真 MCP 工具並列。經 `execute_tool` 調用時，以 `mcp_name:"_custom"` 路由或留空 `mcp_name`（slop-mcp 先查自定義註冊表）。

### Define Custom Tool

```json
{
  "action": "define_custom",
  "name": "figma_page_names",
  "description": "List all page names in a Figma file.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "file_key": {"type": "string", "description": "Figma file key"}
    },
    "required": ["file_key"]
  },
  "body": "doc = execute_tool(\"figma\", \"get_file\", {file_key: args[\"file_key\"]})\nemit(pages: map(doc[\"pages\"], |p| p[\"name\"]))",
  "scope": "project"
}
```

`body` 為 SLOP 腳本字串，調用時執行。返回值為最末表達式之值，或 `emit(...)` 所設命名字段。

### Body Constraints 身體約束

- **No `$`-prefixed variables** — 變量為普通標識符：`doc`、`pages`、`result`。
- **Map field access** — 映射訪問用方括號：`args["file_key"]`、`page["name"]`。
- **Pipe operator `|`** — 鏈式轉換：`items | filter(|x| x["active"]) | map(|x| x["name"])`。
- **Anonymous functions `|param| expr`** — 匿名函數：`map(list, |item| item["id"])`。
- **`execute_tool(mcp, tool, args_map)`** — 身體內可調用任何已注冊 MCP 工具。
- **Body size cap 64 KB** — 超長者以 `SLOP_MAX_CUSTOM_BODY` 環境變量提高上限，或改存為 `.slop` 文件以 `run_slop recipe:` 調用。
- **Recursion depth 16 frames** — 自定義工具互調深度超限返回 `ErrCustomToolRecursion`，非堆棧溢出。
- **Routing** — `execute_tool` 傳 `mcp_name:"_custom"` 或空 `mcp_name`，自定義註冊表先查。
- **Shadow warning** — 若參數鍵名與 SLOP 內建同名（如 `map`、`len`、`filter`），標量簡寫綁定被跳過並記警告；改以 `args["map"]` 直取。

### List and Remove

```json
{ "action": "list_custom", "scope": "project" }
```

```json
{
  "action": "remove_custom",
  "name": "figma_page_names",
  "scope": "project"
}
```

## Staleness Detection

slop-mcp 保存覆蓋時對上游工具 schema 求哈希。下次加載時若上游 schema 已變，該覆蓋 `stale: true`。陳舊覆蓋**仍生效** — 代理不會見到損壞之 schema — 但升級上游前應審查描述是否尚合。

```json
{
  "action": "list_overrides",
  "stale_only": true
}
```

`manage_mcps` 提供捷徑：

```json
{
  "action": "list_stale_overrides"
}
```

升級某 MCP 包版本前宜先運行上述之一，審覆蓋是否需更新。

## Packs: Export / Import

slop-mcp 服務器不讀不寫磁盤文件 — 代理以自身文件系統工具處理 I/O，服務器僅返回或接受 JSON 包對象。

### Export

```json
{
  "action": "export",
  "mcp": "figma",
  "scope": "project"
}
```

省略 `mcp` 則導當前範圍全部。響應包含 `pack` 字段，schema 如下：

```json
{
  "ok": true,
  "action": "export",
  "affected": 4,
  "pack": {
    "schema_version": 1,
    "scope": "project",
    "overrides": [...],
    "custom_tools": [...]
  }
}
```

以 `Write` 工具序列化 `pack` 字段至 `.slop-mcp-packs/figma.json`，git 加入並提交：

```
Write file_path: "<repo>/.slop-mcp-packs/figma.json" content: <JSON.stringify(pack)>
```

### Import

隊友 `git pull` 後，以 `Read` 工具讀包文件，傳其內容為 `data` 字串：

```json
{
  "action": "import",
  "data": "<contents of figma.json as a string>",
  "scope": "project",
  "overwrite": false
}
```

默認合入 — 同名條目保留現有。`overwrite: true` 則替換。注意：包內哈希按原樣導入，若本地 MCP 版本已異，導入之覆蓋可能立即標陳舊。

## Reserved Memory Banks

持久內存中 `_slop.*` 命名空間為 slop-mcp 內部保留。自定義工具身體**可讀** `_slop.*` 經 `mem_get`，但**寫必經 `customize_tools`** — 直呼 `mem_save`、`mem_delete`、memory-cli 至 `_slop.*` 鍵者遭拒。此規守衛覆蓋索引與陳舊哈希，防自定義工具腐壞定制層。

## Image-MCP Compression Walkthrough

Image-generation MCP 常為上下文膨脹之最大元兇：marketing 散文、14 參數（多數可選）、諸采樣器/調度器/checkpoint 枚舉。多數項目實僅用一模型、一解析度、一采樣器。三階段壓縮可將 420 token 之工具降至 12 token。

### Stage 1 — Caveman the Description

替換描述為一行，逐參數標以「Always pass X」或「Leave unset」提示：

```json
{
  "action": "set_override",
  "mcp": "imagegen",
  "tool": "generate_image",
  "description": "Generate image from prompt. Returns PNG bytes.",
  "params": {
    "prompt": "Image description.",
    "model": "Always pass \"flux-schnell\".",
    "width": "Always pass 1024.",
    "height": "Always pass 1024.",
    "steps": "Always pass 4.",
    "cfg_scale": "Leave unset (uses default 1.0).",
    "seed": "Leave unset for random."
  },
  "scope": "project"
}
```

Schema 未變，14 字段仍在；唯散文縮約 ~85%。

### Stage 2 — Push Harder with DO NOT SET

若代理仍盡數回傳所有參數「以防萬一」，以 DO NOT SET 措辭強化：

```json
{
  "action": "set_override",
  "mcp": "imagegen",
  "tool": "generate_image",
  "description": "Generate 1024×1024 PNG from prompt. Pass only `prompt`. Server defaults handle the rest.",
  "params": {
    "prompt": "Image description (required).",
    "model": "DO NOT SET — server uses flux-schnell.",
    "width": "DO NOT SET — server uses 1024.",
    "steps": "DO NOT SET — server uses 4.",
    "cfg_scale": "DO NOT SET."
  },
  "scope": "project"
}
```

此階重在代理順從，非 schema 壓縮。

### Stage 3 — Wrap with a Custom Tool

定義一新工具 `thumbnail`，單字段 schema 將 14 參數之調樣板全部藏於身體：

```json
{
  "action": "define_custom",
  "name": "thumbnail",
  "description": "Generate 1024×1024 thumbnail PNG from a prompt.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "prompt": {"type": "string", "description": "Image description."}
    },
    "required": ["prompt"]
  },
  "body": "execute_tool(\"imagegen\", \"generate_image\", {prompt: args[\"prompt\"], model: \"flux-schnell\", width: 1024, height: 1024, steps: 4, output_format: \"png\"})",
  "scope": "project"
}
```

代理所見：`thumbnail` 一參數，12 token 描述，無枚舉、無可選旋鈕。原 `generate_image` 仍可調，為罕見高級用途保留。

## Cross-references

- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — 定制前提：先以元工具確認欲覆蓋之 MCP 與工具存在。
- Invoke the `Skill` tool with `skill: slop-mcp:scripting` — SLOP 語法全解，為自定義工具身體提供參照。
- Invoke the `Skill` tool with `skill: slop-mcp:memory-system` — 保留內存域 `_slop.*` 語義與寫屏障詳情。
- `/slop-customize` — 交互式包裝 `customize_tools` 八操作之命令（見後續任務）。
- `/slop-pack-export` — 一步導出並寫 `.slop-mcp-packs/<name>.json`（見後續任務）。
- `/slop-pack-import` — 由 `.slop-mcp-packs/<name>.json` 讀入並 `import`（見後續任務）。
- `mcp-orchestrator` agent — Workflow 6「Customize Tool Descriptions」為本技能之協調者級調用。
