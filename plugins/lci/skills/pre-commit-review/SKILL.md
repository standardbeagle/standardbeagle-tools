---
name: pre-commit-review
description: Analyze staged or uncommitted code changes for quality issues before committing. 提交前以LCI分析暫存更改之質量問題。 Use when: pre-commit quality check, PR review, finding duplicates, checking naming conventions, analyzing complexity.
---

# Pre-commit Code Quality Analysis

以LCI之`git_analysis`工具於提交前捕獲代碼質量問題。對比現有代碼庫，查找重複、命名不一致、複雜度問題。

## When to Use

- 即將提交，欲做質量檢查
- 開PR前自查更改
- 查找引入之重複代碼
- 檢查命名約定是否符合代碼庫
- 分析新增或修改函數之複雜度

## Understanding git_analysis

`git_analysis`範圍決定分析對象：

| Scope | What It Analyzes | Use When |
|-------|-----------------|----------|
| `staged` | `git add`'d changes only | Ready to commit |
| `wip` | All uncommitted changes | Still working, want early feedback |
| `commit` | A specific commit | Reviewing past work |
| `range` | A range of commits | Reviewing a branch |

焦點區域控制查找問題類型：

| Focus | What It Finds |
|-------|---------------|
| `duplicates` | Code similar to existing functions in the codebase |
| `naming` | Names that don't match project conventions |
| `metrics` | Functions with high complexity, deep nesting, etc. |

---

## MCP Tool Calls

### Analyze Staged Changes (Default)

提交前執行：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "staged"
  }
}
```

### Analyze All Uncommitted Changes

查所有在製更改：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "wip"
  }
}
```

### Focus on Duplicates Only

查與現有代碼相似之函數：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "staged",
    "focus": ["duplicates"]
  }
}
```

### Focus on Naming Consistency

查新命名是否符合項目約定：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "staged",
    "focus": ["naming"]
  }
}
```

### Focus on Complexity Metrics

查或過於複雜之函數：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "staged",
    "focus": ["metrics"]
  }
}
```

### Adjust Duplicate Sensitivity

降低閾值捕獲更多相似代碼（默認0.8）：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "staged",
    "focus": ["duplicates"],
    "similarity_threshold": 0.7
  }
}
```

### Analyze a Specific Commit

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "commit",
    "base_ref": "HEAD~1"
  }
}
```

### Analyze a Branch Range

對比main分析分支：

```
mcp__plugin_slop-mcp_slop-mcp__execute_tool
Parameters: {
  "mcp_name": "lci",
  "tool_name": "git_analysis",
  "parameters": {
    "scope": "range",
    "base_ref": "main",
    "target_ref": "HEAD"
  }
}
```

---

## CLI Command

```bash
# Analyze staged changes (all focus areas)
lci git-analyze

# Analyze with specific scope
lci git-analyze --scope wip

# Focus on duplicates
lci git-analyze --focus duplicates
```

---

## Workflows

### Pre-commit Quality Check

1. **暫存更改**：`git add <files>`
2. **運行完整分析**：
   ```
   git_analysis，scope: "staged"
   ```
3. **按類別審查發現**：
   - **Duplicates**：考慮提取共享邏輯或重用現有函數
   - **Naming**：重命名以符合項目約定
   - **Metrics**：拆分複雜函數，減少嵌套
4. **修復問題**，重新暫存
5. **重新分析**，驗修復
6. **乾淨後提交**

### Branch Review Before PR

1. **分析完整分支**：
   ```
   git_analysis，scope: "range", base_ref: "main"
   ```
2. **查所有分支提交中積累之重複**
3. **審查所有新符號之命名一致性**
4. **創建PR前解決發現**

### Finding Reuse Opportunities

1. **以低閾值運行重複分析**：
   ```
   git_analysis，scope: "wip", focus: ["duplicates"], similarity_threshold: 0.6
   ```
2. **對每個重複發現**：審查其匹配之現有函數
3. **決策**：重用現有函數、提取共享邏輯，或有理由時保持獨立

---

## Quick Reference

### git_analysis Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `scope` | What to analyze | `"staged"`, `"wip"`, `"commit"`, `"range"` |
| `focus` | Issue categories | `["duplicates"]`, `["naming", "metrics"]` |
| `base_ref` | Start of range | `"main"`, `"HEAD~3"` |
| `target_ref` | End of range | `"HEAD"` |
| `similarity_threshold` | Duplicate sensitivity (0-1) | `0.7` (lower = more matches) |
| `max_findings` | Limit per category | `20` |
