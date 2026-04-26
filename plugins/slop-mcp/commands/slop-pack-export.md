---
name: slop-pack-export
description: "Export a slop-mcp customization scope as a portable JSON pack and write it to `.slop-mcp-packs/<name>.json` for git sharing. 將 slop-mcp 某範圍之覆蓋與自定義工具導出為可攜 JSON 包，寫入 `.slop-mcp-packs/<name>.json` 供 git 分發。 Use when: sharing customizations with teammates, snapshotting a project scope before an MCP upgrade, backing up overrides + custom tools, packaging a single MCP's customizations for distribution."
---

# Export Customization Pack

對 `customize_tools action:"export"` 之命令級包裝。本命令引導用戶選範圍與可選 MCP 過濾，調元工具取響應之 `pack` 字段，以 `Write` 工具序列化至 `.slop-mcp-packs/<name>.json`，最後提示 `git add` 與 commit 步驟。slop-mcp 服務器**不直接寫盤** — 持久化責任全在代理之文件系統工具。

## Tool Call

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"        # default; ask user to switch if needed
  mcp: "<mcp-name>"       # optional filter — omit to export entire scope
```

## Steps

### Step 0 — Verify Target (Precondition)

**對 `mcp` 過濾**：若用戶指定 MCP 名以縮窄導出範圍，先確認該 MCP 已注冊：

```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"
```

若 MCP 不在列表，停止並告用戶 — 以未注冊之 MCP 名導出將返空 `pack` 而誤導用戶以為已備份。

**對範圍**：若用戶選 `local` 範圍，提醒此包來源為 gitignored 之 `<repo>/.slop-mcp/memory.local/_slop/`，導出後寫入 `.slop-mcp-packs/` 雖可提交，但其本質為個人本機條目 — 通常 `project` 範圍方為團隊共享之正解。

未驗證即跳至 Step 1 為違規 — 詳見 `slop-mcp:discovery-first` 技能。

### Step 1 — Choose Pack Name and Output Path

詢問用戶包名 `<name>`（未指定則建議）：

- **單 MCP 導出**：`<name>` 通常等於 MCP 名 — 例 `figma` → `.slop-mcp-packs/figma.json`。
- **整範圍導出**：`<name>` 通常為範圍簡稱 — 例 `project-all` 或 `team-baseline` → `.slop-mcp-packs/project-all.json`。

**輸出路徑慣例**：`<repo>/.slop-mcp-packs/<name>.json`。此目錄為已建立之包共享位置（見 `slop-mcp:tool-customization` 技能與兄弟命令 `/slop-pack-import`）。若目錄不存在，`Write` 工具將自動創建。

### Step 2 — Invoke Export

以收集之 `scope` 與可選 `mcp` 調 `customize_tools`：

```
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"
  mcp: "figma"            # omit for full-scope export
```

響應形如：

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

`affected` 為打包之條目總數（覆蓋 + 自定義工具）。`affected: 0` 通常表 MCP 名拼錯或範圍實無條目 — 停止並回 Step 0 補驗，勿寫空包蓋現有文件。

### Step 3 — Write `pack` Field to File

**僅寫 `pack` 字段**，非整個響應對象。`/slop-pack-import` 將 `data` 參數視為包對象本身（含 `schema_version` / `scope` / `overrides` / `custom_tools`），非含 `ok`/`affected` 之響應信封。

```
Write
  file_path: "<repo>/.slop-mcp-packs/<name>.json"
  content: <JSON.stringify(response.pack, null, 2)>
```

縮進 2 空格令 git diff 與 PR review 可讀。文件寫成後驗其內容首鍵為 `schema_version`，非 `ok`。

### Step 4 — Suggest Git Add / Commit

向用戶提示版本控制步驟：

```bash
git add .slop-mcp-packs/<name>.json
git commit -m "chore(slop-mcp): export <mcp-or-scope> customization pack"
```

提醒：
- `project` 範圍源文件 `<repo>/.slop-mcp/memory/_slop/_slop.overrides.json` 與 `_slop.tools.json` 已自動 commit（按 slop-mcp 之 `project` 範圍語義）；`.slop-mcp-packs/` 之文件為**顯式快照**，便於 PR review 與跨 repo 攜帶。
- `local` 範圍源文件位於 gitignored 目錄；唯經此命令導出至 `.slop-mcp-packs/` 方入版本控制。
- 升級上游 MCP 包前宜先導包以備回滾 — 若升級後覆蓋顯陳舊，可由舊包 `/slop-pack-import` 還原。

## Examples

### Single-MCP export 單 MCP 導出

```
# Step 0 — verify figma is registered
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
  action: "list"

# Step 2 — export project-scope figma customizations
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"
  mcp: "figma"

# Step 3 — write pack field to file
Write
  file_path: "<repo>/.slop-mcp-packs/figma.json"
  content: <JSON.stringify(response.pack, null, 2)>

# Step 4 — git
git add .slop-mcp-packs/figma.json
git commit -m "chore(slop-mcp): export figma customization pack"
```

### Full-scope export 整範圍導出

```
# Step 2 — omit mcp filter to capture all overrides + custom tools in project scope
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"

# Step 3
Write
  file_path: "<repo>/.slop-mcp-packs/project-baseline.json"
  content: <JSON.stringify(response.pack, null, 2)>

# Step 4
git add .slop-mcp-packs/project-baseline.json
git commit -m "chore(slop-mcp): snapshot project customization baseline"
```

### Pre-upgrade backup 升級前備份

```
# Capture current state before bumping the imagegen MCP version
mcp__plugin_slop-mcp_slop-mcp__customize_tools
  action: "export"
  scope: "project"
  mcp: "imagegen"

Write
  file_path: "<repo>/.slop-mcp-packs/backup-imagegen-pre-v2.json"
  content: <JSON.stringify(response.pack, null, 2)>
```

升級後若覆蓋全標陳舊，以 `/slop-pack-import` 從此備份還原即可回滾。

## Forbidden 禁則

1. **寫整個響應對象而非 `pack` 字段** — 若將 `{ "ok": true, "action": "export", "affected": 4, "pack": {...} }` 整體寫入，`/slop-pack-import` 之 `data` 參數將收得錯誤包裝，`schema_version` 鍵不在頂層而導致 import 失敗或行為未定義。**僅序列化 `response.pack`**。
2. **未驗證之 `mcp` 過濾** — 以未注冊 MCP 名導出將返 `affected: 0` 與空 `pack`，蓋現有文件而靜默丟失備份。Step 0 之 `manage_mcps list` 不可省。
3. **寫 `.slop-mcp-packs/` 之外** — 此目錄為已建立之包共享慣例（見 `slop-mcp:tool-customization`）。寫至 `~/Desktop/figma.json` 等非慣例位置令 `/slop-pack-import` 之 `Glob` 步驟（按 `.slop-mcp-packs/*.json` 模式發現）漏失此包。
4. **跳過 `Write` 步驟以 Bash 重定向** — `customize_tools ... | jq .pack > file.json` 之類管道操作繞過 Claude Code 之 Write 鉤子（包括 PostToolUse 通知）並使原子寫保證喪失。一切持久化經 `Write` 工具。

違規恢復：停止 → 補 Step 0 驗證或重提取 `pack` 字段 → 以 `Write` 重發。

## Related

- Invoke the `Skill` tool with `skill: slop-mcp:tool-customization` — 八操作完整語義、`export` 響應之 `pack` 結構（`schema_version` / `scope` / `overrides` / `custom_tools`）、三範圍精度、保留 `_slop.*` 寫屏障、image-MCP 三階壓縮工作流之導出步驟。
- Invoke the `Skill` tool with `skill: slop-mcp:discovery-first` — Step 0 強制流程、未驗證 `mcp` 名之禁則、恢復路徑。
- `/slop-pack-import` — 兄弟命令，對 `.slop-mcp-packs/<name>.json` 執 `Read` + `customize_tools action:"import"`，本命令所寫之文件為其輸入。
- `/slop-customize` — 交互式包裝 `customize_tools` 八操作；本命令為其 `export` 子操作之專用快徑（含文件持久化與 git 提示）。
- `mcp-orchestrator` 代理 — Workflow 6「Customize Tool Descriptions」涵蓋 `customize_tools` 全 8 操作之協調者級調用，包括導出/導入流程。
