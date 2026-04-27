---
name: report
description: Generate multi-page HTML report on project work state from Dart tasks and Claude/opencode/kimi session logs - completed, outstanding, replans, timeline, per-agent activity. 由Dart任務與Claude/opencode/kimi會話日誌生成多頁HTML項目工作狀態報告：已完成、待辦、重規劃、時間線、各代理活動。 Use when: status report, project health report, work summary, dart task report, replan history, generate html dashboard, weekly report
---

# Project Work Report

從Dart任務與會話日誌合成項目工作狀態多頁HTML報告。

> **Access Pattern**: Always call dart-query through slop-mcp:
> ```yaml
> tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
> params:
>   mcp_name: "dart-query"
>   tool_name: "<tool>"
>   parameters: { ... }
> ```

> Companion: `dartai:review` for adversarial audit of inefficiencies and process gaps.

## Inputs

```yaml
dartboard: string         # required - dartboard name or dart_id
project_root: path        # default: cwd
window_days: integer      # default: 14, lookback for log scan
output_dir: path          # default: ./reports/dartai/<timestamp>/
include_agents: [string]  # default: ["claude", "opencode", "kimi"]
```

Prefer asking the user for `dartboard` if not given. Default `window_days` short — large windows balloon parsing time.

## Log Sources

Each agent writes session transcripts to a known path. Filter to entries that mention `project_root` or were initiated from it.

| Agent | Path | Format |
|-------|------|--------|
| Claude Code | `~/.claude/projects/<sanitized-cwd>/*.jsonl` | JSONL, one event per line |
| opencode | `~/.local/share/opencode/storage/session/`, `message/`, `part/` and `~/.local/share/opencode/project/<key>/` | JSON files keyed by id |
| kimi | `~/.kimi/sessions/<id>/<id>.jsonl` and `~/.kimi/user-history/*.jsonl` | JSONL |

Sanitized cwd for Claude Code = absolute path with `/` replaced by `-` (e.g. `/home/beagle/work/foo` → `-home-beagle-work-foo`). If no matching project dir, fall back to scanning all and filter by message contents containing `project_root`.

## Process

### 1. Gather Dart Tasks

```yaml
# Outstanding
list_tasks:
  filters: { dartboard: "<dartboard>", status: "Todo" }
  detail_level: standard
list_tasks:
  filters: { dartboard: "<dartboard>", status: "In Progress" }
  detail_level: standard
list_tasks:
  filters: { dartboard: "<dartboard>", status: "Doing" }   # if present in workspace

# Completed within window
list_tasks:
  filters:
    dartboard: "<dartboard>"
    status: "Done"
    updated_after: "<now - window_days>"
  detail_level: standard

# Blocked / replanned candidates
list_tasks:
  filters: { dartboard: "<dartboard>", status: "Blocked" }
```

For each completed/in-progress task, fetch comments to extract replan signals:
```yaml
get_task:
  dart_id: "<id>"
  include_comments: true
```

Replan markers: comment text containing `replan`, `revised plan`, `pivot`, `scope change`, `rework`, `abandoned approach`, status flips `Done → In Progress`, repeated `task failed` posts.

### 2. Scan Session Logs

For each agent in `include_agents`:
- Enumerate session files within `window_days`.
- Parse JSONL line-by-line — never load whole file into memory.
- Extract: timestamp, session_id, user prompts, assistant text, tool calls (name + brief args), errors, token usage if present.
- Match to project: cwd metadata, file paths under `project_root`, or DART-id mentions.

Cross-reference: map sessions → DART task ids by scanning for `DART-[A-Za-z0-9]+` strings.

### 3. Aggregate Metrics

Per task:
- elapsed wall time (first mention → Done)
- session count touching it
- replan count
- agents involved

Per session:
- duration, prompt count, tool call count, error count
- task ids touched
- top tools by frequency

Per dartboard:
- completion rate (window)
- in-flight count
- median time to Done
- replan rate (% of completed tasks with ≥1 replan signal)

### 4. Render HTML

Write to `output_dir`. Self-contained — inline CSS, no external CDN.

Pages (each linked from `index.html`):

```
index.html              # summary + KPI cards + nav
tasks-completed.html    # table with title, dart_id, agents, duration, replans
tasks-outstanding.html  # grouped by status (Todo/In Progress/Blocked)
replans.html            # tasks with replan signals + comment excerpts
timeline.html           # chronological event stream across agents
agents.html             # per-agent stats: sessions, prompts, tools, errors
sessions.html           # session list with deep-link to original log path
```

HTML conventions:
- Single `style.css` written alongside; light theme, monospace tables.
- Each row links task title → `https://app.dartai.com/t/<dart_id>` if dart_id known.
- Show source path for every log-derived row so user can verify.
- Empty sections render explicit "no data in window" rather than blank.

### 5. Output

Print:
```
Report written: <output_dir>/index.html
Pages: <count>
Tasks: <completed>/<total> completed, <replan_count> with replans
Sessions scanned: <claude>/<opencode>/<kimi>
Window: <window_days> days ending <today>
```

Offer to open in browser if user is local. Do not auto-open.

## Quality Bar

- Every claim in HTML traceable to a dart_id or session file path.
- No fabricated metrics — if a field missing in source logs, show `—` not `0`.
- Replan detection conservative — false positives erode trust. When uncertain, list as "possible replan" in a separate column.
- Report regenerable — running twice with same inputs produces same content modulo timestamps.

## Usage

```
Skill: dartai:report
Args: dartboard="Personal/agnt" window_days=30
```

## Related

- `dartai:review` — audit inefficiencies and process gaps from same data
- `dartai:loop-status` — live view of current Ralph Wiggum loop
- `dartai:sync` — push local work back to Dart before reporting
