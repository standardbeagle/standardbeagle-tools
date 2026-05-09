---
name: caveman-condense-git
description: "Compress git diffs, logs, blame output, and GitHub PR URLs via caveman-mcp. Use for PR review, change summarization, blame archaeology when raw diff exceeds context budget. 以caveman壓縮git diff/log/blame及GitHub PR URL. Use when: review large PR, summarize branch diff, archaeology git blame, ingest PR for memory, prep diff for downstream review agent"
disable-model-invocation: true
---

# condense_git — Git Artifact Compression

壓縮git diff、log、blame輸出，或直接從GitHub PR URL拉取並壓縮。

## When to Use

| Scenario | Action |
|----|----|
| PR > 500行 | `condense_git` with `pr_url` |
| 大型`git log`歷史 | `git log ... \| <pipe to text>` |
| `git blame`整文件 | `git blame ... \| <pipe to text>` |
| 小diff（<200行） | 直接Read，無需壓縮 |
| 需逐行精確審查 | 直接審；caveman為摘要 |

## Access Pattern

```yaml
tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
params:
  mcp_name: "caveman"
  tool_name: "condense_git"
  parameters:
    # ONE of:
    pr_url: "<github-pr-url>"   # GitHub PR
    path: "<file-or-repo-path>" # Local artifact path
    text: "<raw-diff-or-log>"   # Inline text
```

直接：`mcp__plugin_caveman_caveman__condense_git`

恰一個參數必填。三者並列時行為未定義——擇一。

## Examples

### Review a GitHub PR
```yaml
tool_name: condense_git
parameters:
  pr_url: "https://github.com/standardbeagle/agnt/pull/42"
```

返回：標題、文件改動摘要、邏輯改動要點、潛在風險。

### Summarize a local diff
```bash
# First capture diff
git diff main..feature-branch > /tmp/diff.txt
```
```yaml
tool_name: condense_git
parameters:
  path: "/tmp/diff.txt"
```

### Inline diff text
```yaml
tool_name: condense_git
parameters:
  text: |
    diff --git a/foo.py b/foo.py
    index abc..def 100644
    --- a/foo.py
    +++ b/foo.py
    @@ -1,3 +1,4 @@
    +import logging
     def foo():
         pass
```

### Compress git log for branch context
```bash
git log main..HEAD --stat > /tmp/log.txt
```
```yaml
tool_name: condense_git
parameters:
  path: "/tmp/log.txt"
```

### Blame archaeology
```bash
git blame -L 100,200 src/auth.py > /tmp/blame.txt
```
```yaml
tool_name: condense_git
parameters:
  path: "/tmp/blame.txt"
```

## Tips

- **PR URLs**: 公開repo直接走。私有repo用GitHub MCP拉PR數據再傳`text`
- **Multi-file diff**: caveman保留文件邊界，每文件獨立摘要
- **Code preserved**: 函數簽名、變量名、行號保持原樣；散文壓縮
- **Risk surfacing**: PR模式嘗試標出可疑改動（API破壞、安全、性能）但非替代正式review
- **Combine with subagents**: 壓縮diff後遣code-quality-reviewer agent審查摘要
