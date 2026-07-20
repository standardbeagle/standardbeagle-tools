---
name: caveman-research-workflow
description: "Multi-source research recipe via caveman-mcp — gather URLs/PDFs/PRs in parallel, compress each, synthesize with provenance. Pairs with knowledge-hygiene for conflict detection. 多源研究：並行採集、壓縮、含出處合成。 Use when: research topic across sources, prep literature review, ingest reading list, build evidence pack, multi-source synthesis with citations"
disable-model-invocation: true
---

# Research Workflow with caveman

合多源研究配方。caveman壓縮每源，保留出處。配knowledge-hygiene插件可檢測衝突。

## When to Use

| Scenario | Use this workflow |
|----|----|
| 跨多URL/PDF/PR研究主題 | ✅ |
| 為決策建證據包 | ✅ |
| 讀書單批量消化 | ✅ |
| 文獻綜述準備 | ✅ |
| 單源快查 | 直接用對應caveman技能 |
| 需逐字引用法律/合規文本 | ❌ caveman壓縮，逐字用Read |

## Recipe

### Step 1 — Enumerate Sources

列出所有源URL/路徑。組成清單。

```yaml
sources:
  - { type: url, ref: "https://arxiv.org/abs/2604.01007" }
  - { type: url, ref: "https://github.com/anthropics/claude-cookbooks" }
  - { type: file, ref: "/home/beagle/papers/transformer.pdf" }
  - { type: pr, ref: "https://github.com/standardbeagle/agnt/pull/42" }
  - { type: url, ref: "https://news.ycombinator.com/item?id=42424242" }
```

### Step 2 — Parallel Compress

**單訊息含多`execute_tool`調用，並行**：

```yaml
# All in ONE message to maximize parallelism
- tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
  params: { mcp_name: caveman, tool_name: condense_url,  parameters: { url:  "https://arxiv.org/abs/2604.01007" } }
- tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
  params: { mcp_name: caveman, tool_name: condense_url,  parameters: { url:  "https://github.com/anthropics/claude-cookbooks" } }
- tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
  params: { mcp_name: caveman, tool_name: condense_file, parameters: { path: "/home/beagle/papers/transformer.pdf" } }
- tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
  params: { mcp_name: caveman, tool_name: condense_git,  parameters: { pr_url: "https://github.com/standardbeagle/agnt/pull/42" } }
- tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
  params: { mcp_name: caveman, tool_name: condense_url,  parameters: { url:  "https://news.ycombinator.com/item?id=42424242" } }
```

每結果含原始ref（URL/path）作出處。

### Step 3 — Tag Each with Provenance

整理為帶出處之證據包：

```markdown
## Evidence Pack: <topic>

### [Source 1] arxiv.org/abs/2604.01007 — OmniMEM paper
<compressed content>

### [Source 2] github.com/anthropics/claude-cookbooks — repo README
<compressed content>

### [Source 3] /home/beagle/papers/transformer.pdf
<compressed content>

### [Source 4] PR #42 standardbeagle/agnt
<compressed content>

### [Source 5] HN item 42424242 — discussion
<compressed content>
```

### Step 4 — Detect Conflicts (optional)

若安裝knowledge-hygiene插件，遣其`cross-source-conflicts`技能檢測源間矛盾。

### Step 5 — Synthesize with Citations

合成回答時，每claim附`[Source N]`tag。用戶可追溯。

## Subagent Variant

研究體量大時，遣research subagent處理證據包合成，省主上下文：

```yaml
Agent:
  subagent_type: general-purpose
  description: "Synthesize evidence pack on <topic>"
  prompt: |
    Below is an evidence pack of compressed sources. Synthesize a
    summary answering: <specific question>. Cite each claim with
    [Source N] tag. If sources conflict, surface the conflict
    rather than picking one.

    <paste evidence pack>
```

## Tips

- **Parallel ceiling**: 並行5-10源舒服。20+源分批
- **Cache friendly**: caveman內部緩存最近URL。重複源復用
- **Memory storage**: 證據包寫入memory（用`condense_text`再壓一輪）以供後續會話復用
- **Failures non-fatal**: 單源失敗不阻其他。報用戶並繼續
- **Don't over-compress**: 若需逐字引用，跳過caveman直接Read/WebFetch
- **Pair with**: knowledge-hygiene（衝突檢測）、systematic-debugging（根因）、ideation（決策）
