---
name: caveman-setup-caveman
description: "\"Set up caveman-mcp server with SLOP management for context compression. 以SLOP管理配置caveman-mcp服務器以行上下文壓縮. Use when: install caveman, setup context compression, configure caveman-mcp, first time caveman setup, register condense tools\""
disable-model-invocation: true
---

# caveman-mcp Setup

此命令為Claude Code配置caveman-mcp服務器。caveman壓縮URL、文件、圖像、PDF、git artifact、日誌、原始文本，省token於研究、代碼審查、日誌分流。

## Your Task

依下列步驟設置caveman-mcp。

### Step 1: Check Prerequisites

caveman-mcp無需API令牌。僅需`npx`(Node.js 18+)。

驗證node可用：
```bash
node --version  # 應 >= 18
npx --version
```

### Step 2: Install MCP Server

**首選SLOP-MCP：**

調用以下命令檢查slop-mcp是否可用：
```
mcp__plugin_slop-mcp_slop-mcp__get_metadata
```

若slop-mcp可用，以SLOP注冊caveman：
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: register
name: caveman
type: command
command: npx
args: ["-y", "@standardbeagle/caveman-mcp@latest"]
env: {}
scope: user
```

**若slop-mcp不可用，直接安裝：**

工具調用失敗（工具未找到）時，降級為直接Claude MCP安裝：
```bash
claude mcp add caveman --command "npx" --args "-y @standardbeagle/caveman-mcp@latest"
```

### Step 3: Verify Setup

調用`condense_text`測試連接：

**If using slop-mcp:**
```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
mcp_name: caveman
tool_name: condense_text
parameters:
  text: "The quick brown fox jumps over the lazy dog. This sentence has been used to test typewriters since the early days of typewriting."
```

**If using direct install:**
```
mcp__plugin_caveman_caveman__condense_text
text: "..."
```

應返回壓縮後文本，token顯著減少。

若失敗，查看排查節。

## Available Tools

安裝後，以下caveman工具可用：

| Tool | Purpose |
|------|---------|
| `condense_url` | 取URL並壓縮，含YouTube/GitHub/arXiv/HN/Reddit/RSS智能路由 |
| `condense_file` | 壓縮本地文件，含圖像/音頻/簡報/表格/PDF/文本專用處理 |
| `condense_git` | 處理git diff/log/blame及GitHub PR URL |
| `condense_log` | 壓縮錯誤日誌與堆棧追蹤，含語言檢測與去重 |
| `condense_text` | 直接壓縮原始文本輸入 |

**Access Pattern:**
- SLOP: `mcp__plugin_slop-mcp_slop-mcp__execute_tool` with `mcp_name: caveman, tool_name: <tool>`
- Direct: `mcp__plugin_caveman_caveman__<tool>`

## Compression Method

caveman兩階段壓縮：
1. **機械過濾** — 去除填充詞，保留代碼、數字、標識符
2. **LLM超壓縮** — 文言文風格進一步壓縮散文

代碼塊、錯誤消息、URL、版本號保持原樣。

## Troubleshooting

### Server Not Responding
直接測試服務器：
```bash
npx -y @standardbeagle/caveman-mcp@latest
```

若使用SLOP，查看服務器狀態：
```
mcp__plugin_slop-mcp_slop-mcp__manage_mcps
action: status
name: caveman
```

### Tool Not Found Errors
若caveman工具不可用：
1. 驗證安裝成功完成
2. 查看服務器是否已注冊：`claude mcp list`或SLOP的`manage_mcps`搭配`action: list`
3. 嘗試重連：SLOP的`manage_mcps`搭配`action: reconnect, name: caveman`
4. 必要時重新安裝

### npx Slow First Run
首次調用拉取npm包，可能慢。後續調用走npx緩存，秒級。

## Next Steps

安裝後，以caveman技能：
1. 研究URL與文檔，省研究上下文token
2. 摘要大型git diff與PR審查
3. 分流錯誤日誌與堆棧追蹤
4. 從圖像/PDF/簡報提取要點
5. 多源研究工作流，引用緊湊
