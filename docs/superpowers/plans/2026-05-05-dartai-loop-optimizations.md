# DartAI Loop Optimizations — DartQL Adoption + Loop Snapshot Tool

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development OR superpowers:executing-plans. Steps use `- [ ]` checkbox. Each `tdd`-tagged task uses default 5-step ritual from writing-plans skill — not repeated here.

**Goal:** Cut dartai loop API round-trips ~50% by adopting `execute_dartql` in active skills (Track A) and adding `dartai_loop_snapshot` aggregation tool to dart-query MCP (Track B).

**Architecture:** Two-track plan across two repos.
- **Track A** (`/home/beagle/work/standardbeagle-tools/plugins/dartai/`): Rewrite skills/commands to use existing `execute_dartql` for queue scan, sync, phase rotation. No server change. Ship first, measure.
- **Track B** (`/home/beagle/work/mcps/dart-query/`): Add `dartai_loop_snapshot` aggregation tool. Single read returns claimable queue + config + claimed tasks + blocked tasks. Publish to npm. Wire dartai `start.md` startup to call it.

**Tech Stack:** TypeScript MCP server (dart-query), markdown skill files (dartai), DartQL parser (`/src/parsers/dartql.ts`), vitest.

**Spec:** Path B from prior conversation review (staged: snapshot first, defer claim_task / advance_phase). Naming: `dartai_*` prefix. Authoritative claim stays `.dartai-locks.json` git-CAS; tool mirrors state read-only.

**Hot Paths (perf gate):**
- `dartai start.md §3 queue scan` — runs once per loop iteration — bounded by `limit=20` — DartQL: API-native filter (`status='Todo' AND dartboard=...`), client-side LIKE/IN fallback OK at this size — no I/O loops.
- `dartai sync.md bulk update` — runs on demand — bounded by N uncommitted tasks (typical N≤50) — single DartQL UPDATE — 1 list + N parallel PATCH (concurrency=5) — acceptable.
- `dartai_loop_snapshot` aggregation — runs once per loop start — O(1) outbound calls (1 `list_tasks` + 1 `get_config`) — bounded by dartboard size — no expansion to per-task fetches.
- `executor phase rotation` — runs once at task completion — O(1) — single DartQL UPDATE per task.

No red flags: no N+1, no unbounded scans, no hot-path I/O loops.

**File Map:**

Track A (dartai plugin):
- `plugins/dartai/commands/start.md:§3` — modify queue scan to use `execute_dartql` SELECT-equivalent (`dry_run: true`).
- `plugins/dartai/commands/sync.md:§4` — modify bulk update to use `execute_dartql` UPDATE.
- `plugins/dartai/agents/task-executor.md` — modify phase rotation tag updates to single DartQL UPDATE at completion.
- `plugins/dartai/skills/batch-operations.md` — update active examples to favor `execute_dartql`; mark `batch_update_tasks` deprecated.

Track B (dart-query MCP):
- `src/tools/dartai_loop_snapshot.ts` — create. Handler aggregating queue + config + claimed + blocked.
- `src/tools/dartai_loop_snapshot.test.ts` — create. Vitest cases.
- `src/index.ts:~497` — modify. Register `dartai_loop_snapshot` tool schema + switch case.
- `src/types/index.ts` — modify. Add `LoopSnapshotInput` + `LoopSnapshotOutput`.
- `package.json` — modify. Bump version 0.10.5 → 0.11.0.
- `CHANGELOG.md` — modify. Add 0.11.0 entry.
- `TOOLS.md` — modify. Document new tool.

Track B → A wiring:
- `plugins/dartai/commands/start.md:§1+§2.5+§3` — replace 3 sequential calls with single `dartai_loop_snapshot` call.
- `plugins/dartai/.claude-plugin/plugin.json` — bump dartai version (minor).

---

## Track A: DartQL Adoption (no server change)

### Task 1: Queue scan via batch_update_tasks dry-run selector (DartQL SELECT-equivalent)

> **Note**: `execute_dartql` only supports UPDATE/DELETE. The DartQL SELECT-equivalent is `batch_update_tasks(selector, updates={}, dry_run=true)` — already documented in §3 as the "escape valve" but not the primary path. This task promotes it to primary.

```kdl
task n=1 name="dartai-queue-dartql" {
  slice "loop driver runs /dartai:start; queue fetch is one DartQL selector call returning claimable to-do tasks plus tag filter; user sees same loop start"
  files {
    modify "plugins/dartai/commands/start.md:§3"
  }
  signature "queue scan section: replace `list_tasks(dartboard, status='To-do', detail_level='minimal', limit=20)` with `batch_update_tasks(selector: \"status = 'To-do' AND dartboard = '{dartboard}' AND (tags IS NULL OR NOT tags CONTAINS 'loop-blocked')\", updates: {}, dry_run: true, limit: 20)`"
  acceptance "command markdown specifies batch_update_tasks call with updates={} and dry_run=true (read-mode); documents API-native (status, dartboard) vs client-side (tags CONTAINS) filter behavior; retains existing claim-filter logic against .dartai-locks.json after fetch; includes example call snippet; existing 'DartQL escape valve' subsection updated or removed (this IS now the primary path)"
  test-cmd "tests/run-start-tests.sh structure"
  fail-reason "structure probe finds list_tasks reference in §3 — expects batch_update_tasks selector"
  commit-msg "feat(dartai): queue scan via DartQL selector (batch_update_tasks dry-run)"
  perf "1 outbound call (was 1); same; client-side filter on tags fallback acceptable at limit=20"
  tdd
}
```

**Test (executor adds new probe `tests/probes/queue-dartql.sh` and wires into `tests/run-start-tests.sh`):**

```bash
#!/usr/bin/env bash
# queue-dartql.sh — verify §3 of start.md uses batch_update_tasks selector for queue scan.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
file="${REPO_ROOT}/plugins/dartai/commands/start.md"

section_3=$(awk '/^### 3\. Fetch Active Tasks/,/^### 4\. /' "$file")

echo "$section_3" | grep -q 'batch_update_tasks' || { echo "FAIL: §3 missing batch_update_tasks"; exit 1; }
echo "$section_3" | grep -q 'dry_run' || { echo "FAIL: §3 missing dry_run flag"; exit 1; }
echo "$section_3" | grep -q 'selector' || { echo "FAIL: §3 missing selector key"; exit 1; }
if echo "$section_3" | grep -E 'tool_name:\s*"list_tasks"' >/dev/null; then
  echo "FAIL: §3 still calls list_tasks for queue scan"; exit 1
fi
echo "$section_3" | grep -q '\.dartai-locks\.json' || { echo "FAIL: claim filter against locks file removed"; exit 1; }
echo "PASS queue-dartql"
```

**Signature (markdown contract):**

The §3 block must contain a call shape matching:

```
Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart-query"
  tool_name: "batch_update_tasks"
  parameters: {
    "selector": "status = 'To-do' AND dartboard = '[selected dartboard]' AND (tags IS NULL OR NOT tags CONTAINS 'loop-blocked')",
    "updates": {},
    "dry_run": true,
    "limit": 20
  }
```

The dry-run response returns matched task IDs without mutation — DartQL SELECT-equivalent. Follow with: filter result against `.dartai-locks.json` claimed dart_ids (existing logic preserved verbatim). Existing "DartQL escape valve" sub-block in §3 may be removed since this IS now the primary path; the rationale lines about API-native vs client-side filters should remain (rewritten as the primary documentation, not an escape valve).

---

### Task 2: Sync bulk update via execute_dartql

```kdl
task n=2 name="dartai-sync-dartql" {
  slice "user runs /dartai:sync after committing N task closures; one DartQL UPDATE flips all matching to Done; user sees one batch_operation_id instead of N updates"
  files {
    modify "plugins/dartai/commands/sync.md:§4"
  }
  signature "bulk-update section: replace per-task update_task loop and current batch_update_tasks call with `execute_dartql(query: \"UPDATE WHERE dart_id IN ({comma_separated_ids}) SET status='Done' COMMENT 'Synced from {commit_sha}'\", dry_run: false)`"
  acceptance "sync command markdown shows execute_dartql UPDATE with COMMENT clause; documents commit-derived task ID extraction; documents dry_run preview step before execution; retains per-task fallback path when ID extraction yields ≤2 tasks (skip batch overhead)"
  test-cmd "tests/run-start-tests.sh structure"
  fail-reason "structure probe finds batch_update_tasks reference in §4 — expects execute_dartql UPDATE"
  commit-msg "feat(dartai): sync uses execute_dartql UPDATE with audit comment"
  perf "1 outbound call for N≥3 tasks (was N); UPDATE is API-native filter on dart_id IN (...)"
  tdd
}
```

**Test:**

```bash
#!/usr/bin/env bash
set -euo pipefail
file="plugins/dartai/commands/sync.md"
section_4=$(awk '/^## 4\./,/^## 5\./' "$file" || awk '/^### 4\./,/^### 5\./' "$file")
echo "$section_4" | grep -q 'execute_dartql' || { echo "FAIL: §4 missing execute_dartql"; exit 1; }
echo "$section_4" | grep -q 'UPDATE WHERE dart_id IN' || { echo "FAIL: §4 missing UPDATE statement"; exit 1; }
echo "$section_4" | grep -q 'COMMENT' || { echo "FAIL: §4 missing audit COMMENT clause"; exit 1; }
echo "PASS"
```

**Signature (markdown contract):**

§4 must specify two-step protocol:
1. Preview: `execute_dartql(query, dry_run: true)` — verify scan size and target list
2. Execute: `execute_dartql(query, dry_run: false)` — apply

Where `query = "UPDATE WHERE dart_id IN ('id1','id2',...) SET status='Done' COMMENT 'Synced from <sha>'"`.

Plus fallback branch: if N ≤ 2, use individual `update_task` (avoid DartQL overhead).

---

### Task 3: Phase rotation single update at completion

```kdl
task n=3 name="dartai-phase-rotation-coalesce" {
  slice "task-executor finishes work task; instead of 3-4 update_task tag writes during phases, one DartQL UPDATE at completion sets final tag set; user sees one tag transition in Dart UI history"
  files {
    modify "plugins/dartai/agents/task-executor.md"
  }
  signature "phase-tag-tracking section: remove mid-phase tag updates (loop-phase:understanding, loop-phase:testing); local phase tracking only via .dartai/loop-state.json; single DartQL UPDATE at completion: `execute_dartql(query: \"UPDATE WHERE dart_id='{task_id}' SET tags=['loop-complete', 'phase:done'] COMMENT '{completion_summary}'\")`"
  acceptance "executor markdown documents local phase tracking (loop-state.json), single completion UPDATE, no mid-phase Dart writes; loop driver retains ability to read phase from local state for resumption; failure path uses similar single UPDATE with tags=['loop-blocked', 'phase:{failed_phase}']"
  test-cmd "tests/run-start-tests.sh structure"
  fail-reason "probe finds multiple update_task calls with tag mutations in phase sections — expects coalesce"
  commit-msg "feat(dartai): coalesce phase rotation to single DartQL update at task completion"
  perf "1 outbound write per task (was 3-4); local phase state via loop-state.json file write"
  tdd
}
```

**Test:**

```bash
#!/usr/bin/env bash
set -euo pipefail
file="plugins/dartai/agents/task-executor.md"
phase_writes=$(grep -cE 'loop-phase:(understanding|implementing|testing|review)' "$file" || echo 0)
if [ "$phase_writes" -gt 1 ]; then
  echo "FAIL: $phase_writes mid-phase tag writes remain — expected coalesce"
  exit 1
fi
grep -q 'loop-complete' "$file" || { echo "FAIL: completion tag missing"; exit 1; }
grep -q 'execute_dartql' "$file" || { echo "FAIL: completion update missing execute_dartql"; exit 1; }
echo "PASS"
```

**Signature (markdown contract):**

Executor's "Phase Tag Updates" section becomes:
- During phases 0–8: write `{phase, started_at, status}` to `.dartai/loop-state.json` only.
- On phase 9 (completion): single `execute_dartql` UPDATE with `tags=['loop-complete', 'phase:done']` + COMMENT containing summary.
- On failure path: single `execute_dartql` UPDATE with `tags=['loop-blocked', 'phase:{failed_phase}']` + COMMENT containing failure reason.

---

## Track B: dartai_loop_snapshot Tool

### Task 4: Define types + test scaffold

```kdl
task n=4 name="loop-snapshot-types" {
  slice "developer adds new tool — types compile, test file imports handler stub, test fails on missing handler"
  files {
    modify "/home/beagle/work/mcps/dart-query/src/types/index.ts"
    create "/home/beagle/work/mcps/dart-query/src/tools/dartai_loop_snapshot.test.ts"
    create "/home/beagle/work/mcps/dart-query/src/tools/dartai_loop_snapshot.ts"
  }
  signature "type LoopSnapshotInput = { dartboard: string; runner_dart_id?: string; queue_limit?: number }; type LoopSnapshotOutput = { dartboard_id: string; config: { statuses: string[]; assignees: { dart_id: string; email: string }[] }; queue: TaskSummary[]; runner_claimed: TaskSummary[]; blocked: TaskSummary[]; fetched_at: string }; export async function handleDartaiLoopSnapshot(input: LoopSnapshotInput): Promise<LoopSnapshotOutput>"
  acceptance "types exported from src/types/index.ts; test file compiles and imports handleDartaiLoopSnapshot; first test 'returns dartboard_id and config in single call' calls handler with mocked DartClient and asserts shape"
  test-cmd "cd /home/beagle/work/mcps/dart-query && npm run test -- dartai_loop_snapshot"
  fail-reason "ReferenceError or empty implementation — handler not implemented"
  commit-msg "feat(dart-query): add LoopSnapshot types and test scaffold"
  perf "test file mocks DartClient — zero outbound; types are compile-time only"
  tdd
}
```

**Test (`src/tools/dartai_loop_snapshot.test.ts` — executor copies):**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleDartaiLoopSnapshot } from './dartai_loop_snapshot.js';
import type { LoopSnapshotInput, LoopSnapshotOutput } from '../types/index.js';

vi.mock('../api/dartClient.js', () => ({
  DartClient: vi.fn().mockImplementation(() => ({
    listTasks: vi.fn().mockResolvedValue({
      results: [
        { dart_id: 'a', title: 'T1', status: 'Todo', dartboard: 'db1', tags: [] },
        { dart_id: 'b', title: 'T2', status: 'Todo', dartboard: 'db1', tags: ['loop-blocked'] },
        { dart_id: 'c', title: 'T3', status: 'In Progress', dartboard: 'db1', tags: ['claimed:r1'], assignees: ['r1'] },
      ],
    }),
  })),
}));

vi.mock('../cache/configCache.js', () => ({
  configCache: {
    get: vi.fn().mockResolvedValue({
      dartboards: [{ dart_id: 'db1', title: 'Personal/agnt' }],
      statuses: [{ name: 'Todo' }, { name: 'In Progress' }, { name: 'Done' }],
      assignees: [{ dart_id: 'r1', email: 'andy@x.com' }],
    }),
  },
}));

describe('dartai_loop_snapshot', () => {
  it('returns dartboard_id, config, queue, runner_claimed, and blocked in single call', async () => {
    const input: LoopSnapshotInput = { dartboard: 'Personal/agnt', runner_dart_id: 'r1', queue_limit: 20 };
    const result = await handleDartaiLoopSnapshot(input);
    expect(result.dartboard_id).toBe('db1');
    expect(result.config.statuses).toContain('Todo');
    expect(result.config.assignees).toEqual([{ dart_id: 'r1', email: 'andy@x.com' }]);
    expect(result.queue.map((t) => t.dart_id)).toEqual(['a']);
    expect(result.runner_claimed.map((t) => t.dart_id)).toEqual(['c']);
    expect(result.blocked.map((t) => t.dart_id)).toEqual(['b']);
    expect(result.fetched_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('throws if dartboard cannot be resolved', async () => {
    const input: LoopSnapshotInput = { dartboard: 'nonexistent', queue_limit: 20 };
    await expect(handleDartaiLoopSnapshot(input)).rejects.toThrow(/dartboard.*not found/i);
  });

  it('omits runner_claimed when runner_dart_id not provided', async () => {
    const input: LoopSnapshotInput = { dartboard: 'Personal/agnt', queue_limit: 20 };
    const result = await handleDartaiLoopSnapshot(input);
    expect(result.runner_claimed).toEqual([]);
  });
});
```

**Signature (`src/tools/dartai_loop_snapshot.ts`):**

```typescript
import { DartClient } from '../api/dartClient.js';
import { configCache } from '../cache/configCache.js';
import type {
  LoopSnapshotInput,
  LoopSnapshotOutput,
} from '../types/index.js';

export async function handleDartaiLoopSnapshot(
  input: LoopSnapshotInput,
): Promise<LoopSnapshotOutput>;
```

`src/types/index.ts` additions:

```typescript
export interface TaskSummary {
  dart_id: string;
  title: string;
  status: string;
  tags: string[];
  assignees: string[];
}

export interface LoopSnapshotInput {
  dartboard: string;
  runner_dart_id?: string;
  queue_limit?: number;
}

export interface LoopSnapshotOutput {
  dartboard_id: string;
  config: {
    statuses: string[];
    assignees: { dart_id: string; email: string }[];
  };
  queue: TaskSummary[];
  runner_claimed: TaskSummary[];
  blocked: TaskSummary[];
  fetched_at: string;
}
```

---

### Task 5: Implement handler

```kdl
task n=5 name="loop-snapshot-impl" {
  slice "test from Task 4 passes — handler resolves dartboard, fetches config (cached), calls listTasks once with status filter, partitions results into queue / runner_claimed / blocked"
  files {
    modify "/home/beagle/work/mcps/dart-query/src/tools/dartai_loop_snapshot.ts"
  }
  signature "handleDartaiLoopSnapshot resolves dartboard via config (find by name or dart_id), fetches all tasks via listTasks(dartboard_id) up to queue_limit*3 (covers Todo + In Progress + blocked-tagged), then partitions: queue = status='Todo' AND NOT tags.includes('loop-blocked') AND NOT tags.startsWith('claimed:'); runner_claimed = assignees.includes(runner_dart_id) AND status='In Progress'; blocked = tags.includes('loop-blocked'); returns slice of queue to queue_limit"
  acceptance "all 3 tests pass; no extra outbound calls beyond 1 listTasks + 1 cached config; partitioning predicates documented inline; queue_limit defaulted to 20 when omitted"
  test-cmd "cd /home/beagle/work/mcps/dart-query && npm run test -- dartai_loop_snapshot"
  fail-reason "tests assert specific partitioning by tag/status — naive impl will misroute"
  commit-msg "feat(dart-query): implement dartai_loop_snapshot handler"
  perf "1 outbound listTasks (bounded by limit param), 1 cached config read; O(N) partition where N≤queue_limit*3"
  tdd
}
```

**Acceptance details (executor implements body):**

- Resolve `input.dartboard`: lookup in `configCache.get().dartboards` by `title` then by `dart_id`. Throw `Error('dartboard "{name}" not found')` if neither matches.
- Fetch: `client.listTasks({ dartboard: dartboard_id, limit: (input.queue_limit ?? 20) * 3 })`. No status filter — partition client-side to avoid 3 separate calls.
- Partition predicates (in order — first-match wins):
  - `blocked`: `task.tags?.includes('loop-blocked')`
  - `runner_claimed`: `input.runner_dart_id && task.assignees?.includes(input.runner_dart_id) && task.status === 'In Progress'`
  - `queue`: `task.status === 'Todo' && !task.tags?.some(t => t.startsWith('claimed:'))`
  - else: dropped
- `queue` slice to `input.queue_limit ?? 20` after partition.
- `fetched_at`: `new Date().toISOString()`.

---

### Task 6: Register tool in index.ts + version bump

```kdl
task n=6 name="loop-snapshot-register" {
  slice "MCP client invoking dartai_loop_snapshot through dart-query gets routed to handler; tool appears in listTools response; npm package builds and version bumps"
  files {
    modify "/home/beagle/work/mcps/dart-query/src/index.ts"
    modify "/home/beagle/work/mcps/dart-query/package.json"
    modify "/home/beagle/work/mcps/dart-query/CHANGELOG.md"
    modify "/home/beagle/work/mcps/dart-query/TOOLS.md"
  }
  signature "index.ts: import handleDartaiLoopSnapshot at top; add tool schema entry to ListToolsRequestSchema array (name='dartai_loop_snapshot', description, inputSchema with dartboard required and runner_dart_id/queue_limit optional); add case 'dartai_loop_snapshot' in CallToolRequestSchema switch routing to handleDartaiLoopSnapshot. package.json: version 0.10.5 → 0.11.0. CHANGELOG.md: 0.11.0 entry. TOOLS.md: append tool doc."
  acceptance "npm run build succeeds; npm run typecheck succeeds; tool listed in dist/index.js when grepped; CHANGELOG entry under '## 0.11.0' header with current date"
  test-cmd "cd /home/beagle/work/mcps/dart-query && npm run typecheck && npm run build && grep -q dartai_loop_snapshot dist/index.js"
  fail-reason "typecheck or grep fails — tool not registered"
  commit-msg "feat(dart-query): register dartai_loop_snapshot tool, bump 0.11.0"
  perf "registration is compile-time; no runtime cost"
  tdd
}
```

**Tool schema entry (executor inserts into `src/index.ts` tools array, near line 497 after get_task):**

```typescript
{
  name: 'dartai_loop_snapshot',
  description: 'Single-call snapshot for dartai loop startup. Returns claimable queue, config, runner-claimed tasks, and blocked tasks. Replaces 3 sequential calls (get_config + list_tasks + filter) with 1 aggregation. Designed for dartai:start command.',
  inputSchema: {
    type: 'object',
    properties: {
      dartboard: {
        type: 'string',
        description: 'Dartboard name or dart_id (e.g., "Personal/agnt")',
      },
      runner_dart_id: {
        type: 'string',
        description: 'Optional runner dart_id; when provided, runner_claimed array is populated',
      },
      queue_limit: {
        type: 'number',
        description: 'Max queue tasks to return (default 20)',
      },
    },
    required: ['dartboard'],
  },
},
```

Switch case (in `CallToolRequestSchema` handler):

```typescript
case 'dartai_loop_snapshot':
  return formatResponse(await handleDartaiLoopSnapshot(args as LoopSnapshotInput));
```

**CHANGELOG.md entry (executor adds at top below header):**

```markdown
## 0.11.0 — 2026-05-05

### Added
- `dartai_loop_snapshot` tool: single-call aggregation for dartai loop startup. Returns dartboard config, claimable queue, runner-claimed tasks, and blocked tasks in one response. Eliminates 2 round-trips per loop iteration start.
```

---

### Task 7: Wire dartai start.md to call dartai_loop_snapshot

> **Scope nuance**: dartai_loop_snapshot requires `dartboard` as input, so §1 dartboard SELECTION logic must stay (config-cache-first, interactive fallback with `get_config(["dartboards"])` if not cached). Snapshot replaces §2.5 step 3 (assignee resolution) and §3 (queue scan). Insert NEW snapshot-call section between §1.6 and §2.5.

```kdl
task n=7 name="dartai-start-snapshot-wire" {
  slice "user runs /dartai:start; after dartboard selection, loop driver makes single dartai_loop_snapshot call replacing §2.5 assignee fetch + §3 queue scan; user observes faster loop init"
  files {
    modify "plugins/dartai/commands/start.md"
    modify "plugins/dartai/.claude-plugin/plugin.json"
  }
  signature "start.md: keep §1 dartboard selection (config + interactive fallback get_config(['dartboards']) preserved). Insert new snapshot-call section between §1.6 and §2.5 calling dartai_loop_snapshot(dartboard, runner_dart_id?, queue_limit=20) once per loop start, store as `snapshot`. §2.5 step 3: replace get_config(['assignees']) call with read from snapshot.config.assignees. §3: replace batch_update_tasks selector call (Task 1's primary path) with read from snapshot.queue (already partition-filtered). Preserve .dartai-locks.json filter sub-block. plugin.json: bump dartai version to next minor."
  acceptance "probe finds dartai_loop_snapshot referenced; §2.5 reads snapshot.config.assignees instead of get_config(['assignees']); §3 reads snapshot.queue instead of batch_update_tasks selector; .dartai-locks.json filter retained in §3; §1 dartboard selection logic and its fallback get_config(['dartboards']) preserved"
  test-cmd "bash tests/probes/start-snapshot.sh"
  fail-reason "probe finds list_tasks/batch_update_tasks remnant in §3 OR get_config(['assignees']) call in §2.5 step 3 OR no dartai_loop_snapshot reference — expects snapshot integration"
  commit-msg "feat(dartai): use dartai_loop_snapshot for loop startup aggregation"
  perf "1 outbound snapshot call replaces 2 (get_config(assignees) + batch_update_tasks selector); §1 fallback get_config(['dartboards']) only fires when dartboard uncached"
  tdd
}
```

**Test (`tests/probes/start-snapshot.sh`):**

```bash
#!/usr/bin/env bash
# start-snapshot.sh — verify start.md integrates dartai_loop_snapshot for §2.5 assignee + §3 queue.
set -uo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
file="${REPO_ROOT}/plugins/dartai/commands/start.md"

# Snapshot tool referenced.
grep -q 'dartai_loop_snapshot' "$file" || { echo "FAIL: dartai_loop_snapshot not referenced anywhere"; exit 1; }

# §3 no longer calls batch_update_tasks for queue scan (Task 1 introduced it; Task 7 replaces with snapshot read).
section_3=$(awk '/^### 3\. Fetch Active Tasks/,/^### 4\. /' "$file")
if echo "$section_3" | grep -E 'tool_name:[[:space:]]*"batch_update_tasks"' >/dev/null; then
  echo "FAIL: §3 still calls batch_update_tasks — expects read from snapshot.queue"; exit 1
fi
if echo "$section_3" | grep -E 'tool_name:[[:space:]]*"list_tasks"' >/dev/null; then
  echo "FAIL: §3 still calls list_tasks"; exit 1
fi
echo "$section_3" | grep -q 'snapshot\.queue\|snapshot\[.queue.\]' || { echo "FAIL: §3 missing read from snapshot.queue"; exit 1; }
echo "$section_3" | grep -q '\.dartai-locks\.json' || { echo "FAIL: §3 claim filter against locks removed"; exit 1; }

# §2.5 step 3 reads snapshot.config.assignees instead of get_config(['assignees']).
section_2_5=$(awk '/^### 2\.5\. Resolve Runner Identity/,/^### 3\. Fetch Active Tasks/' "$file")
echo "$section_2_5" | grep -q 'snapshot\.config\.assignees' || { echo "FAIL: §2.5 missing read from snapshot.config.assignees"; exit 1; }

# §1 dartboard selection still allows get_config(['dartboards']) fallback.
section_1=$(awk '/^### 1\. Determine Target Dartboard/,/^### 1\.5/' "$file")
echo "$section_1" | grep -q 'get_config' || { echo "FAIL: §1 dartboard fallback get_config removed (must remain for uncached path)"; exit 1; }

echo "PASS start-snapshot"
```

**Signature (markdown contract):**

Insert NEW section between §1.6 and §2.5 (suggested heading: `### 1.7 Loop Snapshot` to preserve existing § cross-references):

```
Once dartboard is selected and runner identity resolution begins, fetch the loop snapshot once:

Use mcp__plugin_slop-mcp_slop-mcp__execute_tool with:
  mcp_name: "dart-query"
  tool_name: "dartai_loop_snapshot"
  parameters: {
    "dartboard": "[selected dartboard]",
    "runner_dart_id": "[resolved runner_dart_id from §2.5 step 3, or omit on first call]",
    "queue_limit": 20
  }

Store response as `snapshot`. Reused by §2.5 (assignee match) and §3 (queue scan).
```

§2.5 step 3 (assignee match): change "Use mcp...get_config(['assignees'])..." block to "Read `snapshot.config.assignees`" prose with same matching logic.

§3: replace `batch_update_tasks` selector call block with "Read `snapshot.queue` (already filtered: status=Todo, NOT loop-blocked, NOT claimed:*)" prose. Preserve "Filter by claim status:" sub-block (.dartai-locks.json filter applies to snapshot.queue).

**Note on chicken-and-egg**: snapshot needs `runner_dart_id` (resolved in §2.5 step 3) but §2.5 step 3 needs assignees (from snapshot). Resolve by either:
- (a) Calling snapshot WITHOUT runner_dart_id first (yields config + queue + blocked + empty runner_claimed), use that config.assignees to resolve runner_dart_id, optionally re-call with runner_dart_id to populate runner_claimed; OR
- (b) Splitting §2.5: identity steps (1, 2, 5, 6 — env, git email, agent_id, persist) run before snapshot, then snapshot called WITH runner_dart_id populated by reading existing `.dartai/config.local.md` cache (if present), assignee match step 3 deferred to AFTER snapshot when no cache.

Pick (a) for simplicity — one call, no conditional. The empty runner_claimed in first iteration is acceptable; cached runner_dart_id from `.dartai/config.local.md` covers the common case where runner identity is stable across loop sessions.

---

## Self-Review

1. **Spec coverage:** Track A covers all three skills the recon flagged (start.md §3, sync.md §4, executor phase rotation). Track B covers the staged Phase 1 (snapshot only). claim_task / advance_phase deferred to future plan as agreed. ✓
2. **Vertical slice:** Each task ends with user-visible behavior. Task 1 = loop startup uses DartQL. Task 4 = test scaffold compiles (developer-visible). Task 5 = test passes (developer). Task 6 = npm package builds + tool discoverable (MCP-client-visible). Task 7 = end-to-end loop start uses snapshot tool (user-visible). Tasks 4–6 are developer-facing slices on dart-query side; acceptable since dart-query is consumed by dartai which gets user-facing slice in Task 7. ✓
3. **Perf gate:** Hot paths listed. No N+1, no unbounded scans, listTasks bounded by limit. Client-side partitioning O(N) on bounded N. ✓
4. **Placeholder scan:** No TBD/TODO. Test bodies provided. Type signatures specified. Acceptance criteria concrete. ✓
5. **Type consistency:** `LoopSnapshotInput`/`LoopSnapshotOutput` defined in Task 4, used in Tasks 5/6. `TaskSummary` shared across all three arrays. `dart_id` (not `id` or `task_id`) — matches dart-query convention per existing types. ✓
6. **DRY:** TDD ritual not repeated. KDL frontmatter used. Spec referenced not restated. ✓

---

## Execution Notes

- Tasks 1–3 (Track A) can run in parallel — independent files.
- Tasks 4 → 5 → 6 (Track B server) sequential — same files chained.
- Task 7 depends on Task 6 (tool must be published or local-installed for testing).
- After Task 6: publish to npm (`npm publish` from `/home/beagle/work/mcps/dart-query`) before Task 7 wiring takes effect for end users. For local testing, install via `npx @standardbeagle/dart-query@0.11.0` after publish, or use `npm link` for unpublished verification.
- Measurement gate between Track A complete and Track B kickoff: count loop startup outbound calls before/after Track A. If reduction ≥ 30% and startup latency acceptable, defer Track B. If still painful, proceed with Tasks 4–7.
