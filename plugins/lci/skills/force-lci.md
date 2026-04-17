---
name: force-lci
description: Toggle force-LCI mode to block standard search tools and require LCI. 強制啟用LCI模式，封鎖Grep/Glob。 Use when: forcing all searches through LCI, benchmarking LCI, disabling force mode.
trigger: When user asks to "force lci", "enable force lci mode", "disable force lci mode", "toggle force lci", or similar
---

# Force LCI Mode

此技能切換「強制LCI模式」，封鎖Claude Code標準搜索工具（Grep、Glob），令所有代碼及文件名搜索均通過Lightning Code Index（LCI）MCP伺服器。

## When to Use

以下情形啟用此技能：
- 用戶欲確保所有搜索使用LCI語義搜索能力
- 用戶欲基準測試LCI性能，防止回退至標準工具
- 用戶偏好LCI代碼智能功能用於所有搜索
- 用戶欲禁用強制模式，恢復標準工具訪問

## How It Works

強制LCI模式**啟用**時：
- `Grep`工具調用被封鎖，提示改用LCI搜索
- `Glob`工具調用被封鎖，提示改用LCI搜索
- 狀態文件創建於`~/.config/claude-code/lci-force-mode`
- PreToolUse鉤子攔截並封鎖標準工具

強制LCI模式**禁用**時：
- 標準Grep和Glob工具正常運作
- 狀態文件刪除
- 鉤子允許所有工具使用

## Implementation

### To Enable Force-LCI Mode

```bash
# Create state directory and enable flag
mkdir -p ~/.config/claude-code
touch ~/.config/claude-code/lci-force-mode
echo "Force-LCI mode is now ENABLED. All Grep and Glob searches will be blocked. Use LCI tools instead."
```

### To Disable Force-LCI Mode

```bash
# Remove the flag
rm -f ~/.config/claude-code/lci-force-mode
echo "Force-LCI mode is now DISABLED. Standard search tools are available."
```

### To Check Current Status

```bash
if [ -f ~/.config/claude-code/lci-force-mode ]; then
  echo "Force-LCI mode: ENABLED"
else
  echo "Force-LCI mode: DISABLED"
fi
```

## What Claude Should Do

用戶請求啟用/禁用/切換強制LCI模式時：

1. **查當前狀態**，執行上述狀態檢查
2. **切換模式**，創建或刪除狀態文件
3. **確認更改**，告知用戶
4. **說明效果**：
   - 啟用時："Standard Grep and Glob tools are now blocked. Please use /search or /explore commands, or the LCI MCP tools directly."
   - 禁用時："Standard Grep and Glob tools are now available again."

## Example Usage

**User**: "Enable force LCI mode"

**Claude**:
```bash
mkdir -p ~/.config/claude-code
touch ~/.config/claude-code/lci-force-mode
```

Force-LCI mode is now enabled. All attempts to use the standard Grep and Glob tools will be blocked. Please use:
- `/search <query>` - Semantic code search through LCI
- `/explore` - Explore codebase structure
- LCI MCP tools directly via the tools plugin

**User**: "Search for error handling"

**Claude**: [Attempts Grep, gets blocked by hook, uses LCI search instead]

**User**: "Turn off force LCI mode"

**Claude**:
```bash
rm -f ~/.config/claude-code/lci-force-mode
```

Force-LCI mode is now disabled. Standard Grep and Glob tools are available again.

## Technical Details

強制LCI模式通過以下實現：
- **State file**: `~/.config/claude-code/lci-force-mode`（存在=啟用）
- **PreToolUse hook**: 執行前攔截Grep和Glob
- **Hook script**: `${CLAUDE_PLUGIN_ROOT}/scripts/block-search-tools.sh`

鉤子檢查狀態文件；若模式啟用，以退出碼1封鎖工具。
