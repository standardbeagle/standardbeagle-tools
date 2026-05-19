# Memory Write Protocol (loop iterations)

Loaded by the `task-execution` skill when the executor needs to write memory entries.

任務執行期間若寫入 memory（包括 `~/.claude/projects/<project>/memory/*.md`、Dart task memory comments、或 `.dartai/loop-state.json` 之 task entries），每條 entry 必須帶兩個欄位：

```yaml
memory_entry_required_fields:
  timestamp:
    format: "ISO 8601 with timezone (e.g. 2026-04-26T14:30:00-05:00)"
    semantics: "When this memory was written"
    rationale: "Enables temporal ordering and stale-detection"

  source_event:
    shape:
      loop_id: "<parent loop dart task-id>"
      task_id: "<task being executed when memory was written>"
      conversation_id: "<session id if available, else null>"
    semantics: "Why-from-where this memory was written"
    rationale: |
      Pairs each memory with the orchestration event that produced it,
      so future readers can trace a memory back to its triggering task.
```

Cite: dev-standards `memory-needs-source` rule (commit 9ab9c47) — this is the canonical project rule. This subsection is a thin pointer; consult the rule for full enforcement details and exception handling.

## Examples

```yaml
memory_write_examples:
  loop_state_task_entry:
    # In .dartai/loop-state.json under tasks[]
    {
      "task_id": "abc123",
      "started_at": "2026-04-26T14:30:00-05:00",  # timestamp ✓
      "source_event": {                             # source_event ✓
        "loop_id": "loop-task-id",
        "task_id": "abc123",
        "conversation_id": "session-xyz"
      },
      "...other fields..."
    }

  dart_memory_comment:
    # When add_task_comment writes a memory-class comment
    text: |
      ## Memory: Pattern observed
      **Timestamp:** 2026-04-26T14:30:00-05:00
      **Source:** loop=<loop-id> task=<task-id> session=<session-id>

      <memory body>

  project_memory_file:
    # When writing ~/.claude/projects/<slug>/memory/<id>.md
    frontmatter:
      ---
      timestamp: "2026-04-26T14:30:00-05:00"
      source_event:
        loop_id: "<loop task-id>"
        task_id: "<task-id>"
        conversation_id: "<session-id or null>"
      ---
      <memory body>
```

**Soft-deprecation 軟棄用**：legacy memory entries lacking these fields remain readable. Audit tools may flag them but must not crash. New writes during loop iterations MUST include both fields.

**Why this matters**: without timestamp+source_event, memories accumulate as un-attributed claims that future agents cannot audit, leading to the rationalization-trap class (silent contradiction) flagged in commit 4526ba5. The provenance pair is the cheapest possible defense.
