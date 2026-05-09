---
name: mcp-status
description: Check LCI MCP server registration status across slop-mcp and standard configurations. 查LCI伺服器登錄狀態。 Use when: checking if lci is registered, diagnosing connection errors, verifying index status.
---

# LCI MCP Status

此技能查LCI MCP伺服器之登錄狀態，報其配置。

## Status Check Flow

### Step 1: Check Binary Location

先定lci安裝處：

```bash
# Check common installation locations
for loc in "$HOME/.local/bin/lci" "$HOME/go/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "Binary: $loc"
    "$loc" --version
    exit 0
  fi
done

# Check system PATH
if command -v lci &> /dev/null; then
  echo "Binary: $(which lci)"
  lci --version
else
  echo "Binary: npx @standardbeagle/lci (no local installation)"
fi
```

### Step 2: Check slop-mcp Registration

詢slop-mcp，查lci登錄狀：

```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: { "action": "status" }
```

**析回應：**
- 若slop-mcp可用且lci已列：記state、tool_count、source
- 若slop-mcp可用而lci未列：記可用slop-mcp
- 若slop-mcp不可用：略，轉Step 3

### Step 3: Check Tool Availability

取工具詳情：

```
Call: mcp__lci__info
Parameters: { "tool": "version" }
```

回lci版本及能力。

### Step 4: Verify Index Status

查lci是否已索引當前項目：

```
Call: mcp__lci__code_insight
Parameters: { "mode": "statistics" }
```

示：
- 已索文件數
- 已索符號數
- 檢出語言
- 索引新鮮度

## Status Report Format

生狀態報告：

```markdown
## LCI MCP Status Report

### Binary Location
| Location | Status | Version |
|----------|--------|---------|
| ~/.local/bin/lci | <found/not found> | <version if found> |
| ~/go/bin/lci | <found/not found> | <version if found> |
| System PATH | <found/not found> | <version if found> |
| Fallback | npx @standardbeagle/lci | <always available> |

**Active**: <which location is being used>

### Registration
| Method | Status | Details |
|--------|--------|---------|
| slop-mcp | <connected/error/unavailable> | <tool count if connected> |
| Standard (mcp.json) | <active/inactive> | <configuration location> |

### Server Info
- **Version**: <lci version>
- **Status**: <connected/error>
- **Tool Count**: <number of tools>

### Index Status
- **Files Indexed**: <count>
- **Symbols**: <count>
- **Languages**: <list>
- **Last Updated**: <timestamp>

### Available Tools
<list of lci tools>

### Recommendations
<any suggestions based on status>
```

## Diagnostic Commands

若檢出問題，建議以下診斷：

### Check if lci binary is accessible
```bash
# Check installation locations
for loc in "$HOME/.local/bin/lci" "$HOME/go/bin/lci"; do
  if [ -x "$loc" ]; then
    echo "Found: $loc"
    "$loc" --version
    exit 0
  fi
done

if command -v lci &> /dev/null; then
  echo "Found in PATH: $(which lci)"
  lci --version
else
  echo "Not installed locally - using npx fallback"
  npx -y @standardbeagle/lci --version
fi
```

### Check MCP server startup
```bash
lci mcp --help
# or if using npx:
npx -y @standardbeagle/lci mcp --help
```

### Test MCP communication
```
Call: mcp__lci__search
Parameters: { "pattern": "test", "max": 1 }
```

## Common Issues

### Connection Error (EOF)

若lci示"failed to connect"含EOF錯誤：
- `mcp`子命令或缺於args
- 正確：`args: ["mcp"]`
- 誤：`args: []`或無args

### Binary Not Found

若npx找不到二進位：
1. 清npm緩存：`npm cache clean --force`
2. 顯式安裝：`npm install -g @standardbeagle/lci`
3. 驗：`npx @standardbeagle/lci --version`

### Duplicate Registration

若lci同時登錄於slop-mcp與標準mcp.json：
- 工具或以不同前綴出現兩次
- 建選一法
- 僅slop-mcp：插件之mcp.json.disabled保持禁用
- 僅標準：從slop-mcp登出

### Index Not Found

若`code_insight`無結果：
- lci首次使用時自動建索引
- 或手動執行：`lci status`於項目根目錄
- 若文件被排除，查`.lci.kdl`配置

## Migration Path

### From npx to local binary
1. 本地安裝lci：
   ```bash
   npm install -g @standardbeagle/lci
   # or
   go install github.com/standardbeagle/lci/cmd/lci@latest
   ```
2. 更新slop-mcp登錄，使用本地二進位路徑
3. 驗：`lci --version`

### Updating slop-mcp registration
```
Call: mcp__plugin_slop-mcp_slop-mcp__manage_mcps
Parameters: {
  "action": "register",
  "name": "lci",
  "command": "<new-command>",
  "args": ["mcp"],
  "scope": "user"
}
```
