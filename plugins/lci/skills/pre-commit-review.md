---
name: pre-commit-review
description: Analyze staged or uncommitted code changes for quality issues before committing
allowed-tools: ["mcp__plugin_slop-mcp_slop-mcp__execute_tool"]
---

# Pre-commit Code Quality Analysis

Use LCI's `git_analysis` tool to catch code quality issues before committing. It compares your changes against the existing codebase to find duplicates, naming inconsistencies, and complexity problems.

## When to Use

- About to commit and want a quality check
- Reviewing your own changes before opening a PR
- Looking for duplicate code you may have introduced
- Checking if naming conventions match the codebase
- Analyzing complexity of new or modified functions

## Understanding git_analysis

`git_analysis` scopes determine what code is analyzed:

| Scope | What It Analyzes | Use When |
|-------|-----------------|----------|
| `staged` | `git add`'d changes only | Ready to commit |
| `wip` | All uncommitted changes | Still working, want early feedback |
| `commit` | A specific commit | Reviewing past work |
| `range` | A range of commits | Reviewing a branch |

Focus areas control what issues to look for:

| Focus | What It Finds |
|-------|---------------|
| `duplicates` | Code similar to existing functions in the codebase |
| `naming` | Names that don't match project conventions |
| `metrics` | Functions with high complexity, deep nesting, etc. |

---

## MCP Tool Calls

### Analyze Staged Changes (Default)

Run this before committing:

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

Check everything you've been working on:

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

Find functions similar to existing code:

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

Check if new names match project conventions:

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

Find functions that may be too complex:

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

Lower threshold catches more similar code (default 0.8):

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

Compare branch against main:

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

1. **Stage your changes**: `git add <files>`
2. **Run full analysis**:
   ```
   git_analysis with scope: "staged"
   ```
3. **Review findings** by category:
   - **Duplicates**: Consider extracting shared logic or reusing existing functions
   - **Naming**: Rename to match project conventions
   - **Metrics**: Break up complex functions, reduce nesting
4. **Fix issues** and re-stage
5. **Re-analyze** to verify fixes
6. **Commit** when clean

### Branch Review Before PR

1. **Analyze full branch**:
   ```
   git_analysis with scope: "range", base_ref: "main"
   ```
2. **Check for accumulated duplicates** across all branch commits
3. **Review naming consistency** for all new symbols
4. **Address findings** before creating PR

### Finding Reuse Opportunities

1. **Run duplicate analysis** with lower threshold:
   ```
   git_analysis with scope: "wip", focus: ["duplicates"], similarity_threshold: 0.6
   ```
2. **For each duplicate finding**: review the existing function it matches
3. **Decide**: reuse existing function, extract shared logic, or keep separate if warranted

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
