# R5 — Query Languages in MCPs: A Case Study from dart-query / DartQL

**Status:** Draft
**Dart task:** _(unassigned)_
**Author:** Claude (Opus 4.7), session of 2026-05-04
**Date:** 2026-05-04
**Time-boxed:** evergreen reference
**Related:** [R2 dartai sub-dispatch interface](./R2-dartai-subdispatch-interface.md), dartai plugin commands `start.md`, `sync.md`, skills `batch-operations.md`, `task-filtering.md`.

---

## 1. Executive Summary

MCP tool surfaces tend to grow one-tool-per-verb. `get_task`, `update_task`, `list_tasks`, `add_comment`, `set_priority`, `move_task`, `add_blocker`, `remove_blocker`, etc. Each verb is hand-authored, schema-described, registered, and shipped. Each new combination — "fetch all open high-priority tasks blocked by tag X assigned to user Y, and bump them to In Progress" — requires either:

1. A new bespoke tool (verb-explosion), or
2. N round-trips through existing primitives (token-explosion), or
3. A query language baked into a few generalized tools (this case study).

`dart-query` chose option 3. It exposes 27 tools, but the gravitational center is **DartQL** — a SQL-92-style WHERE language threaded through `list_tasks`, `batch_update_tasks`, `batch_delete_tasks`, and the modern unifier `execute_dartql`. This note documents the design, quantifies the win against the dartai planning/execution loop as a real workload, and extracts a decision framework for future MCP design.

**Bottom line:** for any MCP whose domain is naturally relational (tasks, files, records, events, configs), a query language collapses tool count, eliminates round-trips, and pushes filter logic to the data plane. The cost is parser complexity, a learning curve for the LLM caller, and a discipline about which fields stay API-native vs. fall back to client-side filter. For dartai's loop, modeled migration drops 30–50% of dart-query token traffic with zero server changes — the language already exists; the loop is just not using it.

---

## 2. The Verb-Explosion Problem

### 2.1 What goes wrong as MCPs grow

Every additional verb on an MCP adds:

| Cost | Where it shows up |
|---|---|
| Schema bytes loaded into the LLM's context window | `tools/list` response, system prompt overhead |
| Decision burden | LLM must choose among more near-duplicate tools |
| Maintenance | Each handler is a separate file, a separate test, a separate migration when the underlying API shifts |
| Versioning | Bumping one field-aware tool means a release; ten field-aware tools means ten releases or one fragile coupled release |
| Combinatorial gaps | "fetch+filter+update" workflows multiply: every combination of fetch shape × filter × update is a missing tool until somebody writes it |

The pattern is familiar from REST APIs that grow `/v1/users/by-email`, `/v1/users/by-team`, `/v1/users/by-role-and-team` over time. The fix at REST scale is a query parameter or a search endpoint. The fix at MCP scale is a query language.

### 2.2 The token math

A modern LLM coding harness pays for tools twice: at registration (system prompt), and at call time (arguments + response). For an MCP with `N` verbs and average schema size `S` bytes:

- Registration cost ≈ `N × S` tokens, paid every turn the tool catalog is in context.
- Call cost = arguments + response, per call, per round-trip.

Compressing `N` from, say, 27 verbs to 5 generalized tools with one shared query language can drop registration cost by half or more, and a single batched query call replaces N sequential primitives.

Anthropic's 2025 essay on [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) makes the converse case: stop loading tool schemas at all, expose MCPs as code APIs the model writes against. Both approaches share the same diagnosis — verb-per-action is too granular for an LLM consumer. They diverge on the fix. Query languages are the relational-data sibling of that argument.

---

## 3. dart-query / DartQL: Anatomy

### 3.1 Surface area

Dart-query exposes **27 MCP tools** (see `/src/index.ts` in `~/work/mcps/dart-query`), but the meaningful count for this case study is much smaller:

| Layer | Tools | Role |
|---|---|---|
| Discovery | `info`, `get_config` | Schema + workspace shape |
| Reads | `list_tasks`, `search_tasks`, `get_task` | Single, filtered, full-detail |
| Writes (single) | `create_task`, `update_task`, `delete_task`, `add_task_comment`, `move_task` | Targeted mutations |
| **Reads/Writes (query)** | **`batch_update_tasks`, `batch_delete_tasks`, `execute_dartql`** | **DartQL-driven** |
| Bulk import | `import_tasks_csv`, `get_batch_status` | Async bulk |
| Docs/nav | `list_docs`, `get_dartboard`, etc. | Workspace metadata |

The italicized "query" row carries disproportionate weight. Anything reachable by selector — filtering open tasks, mass-updating tags, conditional deletes — funnels through these three.

### 3.2 DartQL: the language itself

Source: `~/work/mcps/dart-query/src/parsers/dartql.ts` (~1,900 lines). Pipeline: tokenizer → lexer with field validation → recursive-descent parser → AST → filter-converter that splits into "API-native" filters (sent to Dart's REST API as query params) and "client-side" predicates (evaluated locally after fetch).

**Grammar highlights:**

- **Fields** (28 valid): `status`, `priority`, `size`, `title`, `description`, `assignee`, `dartboard`, `tags`, `created_at`, `updated_at`, `due_at`, `start_at`, `completed_at`, `parent_task`, `dart_id`, `subtask_ids`, `blocker_ids`, `blocking_ids`, `duplicate_ids`, `related_ids`, …
- **Comparison:** `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`, `LIKE`, `CONTAINS`
- **Set/range:** `IN (…)`, `NOT IN`, `BETWEEN x AND y`, `IS NULL`, `IS NOT NULL`
- **Logical:** `AND` (higher precedence), `OR`, `NOT`
- **Wildcards:** `%`, `_` for `LIKE`
- **Mutation forms** (`execute_dartql`): `UPDATE WHERE … SET field = value [, …] [COMMENT '…']`, `DELETE WHERE … CONFIRM`, multi-statement via `;`
- **Template interpolation:** `SET status = '{status}'` lets the caller pass a values map alongside the query

### 3.3 Representative queries

```sql
-- 1. Queue scan: claimable open tasks, no blockers, not loop-blocked, not held by another runner
SELECT WHERE status = 'To-do'
  AND blocker_ids IS NULL
  AND NOT tags CONTAINS 'loop-blocked'
  AND assignee != '{other_runner_id}'

-- 2. Bulk phase rotation at loop end
UPDATE WHERE dart_id IN ('a1', 'b2', 'c3')
  SET tags = ['loop-complete', 'phase:done']
  COMMENT 'Loop {loop_id} completed iteration {n}'

-- 3. Sync committed work to Done
UPDATE WHERE dart_id IN ({committed_ids})
  SET status = 'Done'
  COMMENT 'Synced from {sha}'

-- 4. Cleanup: trash auto-resolved fixes older than 30 days
DELETE WHERE completed_at < '2026-04-04'
  AND tags CONTAINS 'auto-resolved'
  CONFIRM
```

### 3.4 The split: API-native vs. client-side

Not every operator translates to a Dart REST query parameter. The filter-converter classifies each predicate:

| Filter type | Resolution |
|---|---|
| `status = X`, `assignee = X`, `dartboard = X`, `priority = N`, `tags = X`, `due_before/after` | **API-native** — passed as query params |
| `LIKE`, `CONTAINS`, `IN (…)`, `NOT IN`, `BETWEEN`, `IS NULL`, `OR`, `NOT`, range operators on priority | **Client-side** — fetched broadly, then filtered locally |
| Hybrid (`dartboard = 'X' AND title LIKE 'Y%'`) | API-native part narrows the fetch; client-side completes |

This split is the case study's most important honest disclosure: a naive selector with only client-side operators **fetches the entire dartboard** before filtering. `dry_run: true` (default on mutations) previews scan size before commit. Skill `dartai:batch-operations` already warns; production DartQL adoption needs the same warning surface in any caller skill.

### 3.5 Safety affordances

- `dry_run: true` is the **default** on `batch_update_tasks` and `batch_delete_tasks`. Returns up to 10 (updates) / 20 (deletes) preview rows showing before/after.
- `confirm: true` is **required** on real `batch_delete_tasks` execution. `execute_dartql` enforces `CONFIRM` keyword in the statement.
- Concurrency cap (1–20, default 5) on parallel writes.
- Per-task atomic; partial failure tracked via in-memory `batch_operation_id` (1-hour TTL, queryable via `get_batch_status`).
- Relationship arrays default to **full replacement**, not append — explicit `add_to`/`remove_from` modifiers in `update_task` for additive semantics. (Footgun if missed; documented in tool description.)

---

## 4. The dartai Loop as a Workload

### 4.1 What the loop does

The dartai Ralph Wiggum adversarial loop (driver: `plugins/dartai/commands/start.md`, executor: `plugins/dartai/agents/task-executor.md`, gate framework: `plugins/dartai/skills/adversarial-quality-loop.md`) runs this cycle:

1. **Startup** — fetch dartboards/assignees/statuses, resolve runner identity, restore interrupted loop state.
2. **Queue scan** — list claimable To-do tasks on the dartboard.
3. **Claim** — git-CAS via `.dartai-locks.json`, then mark assignee + In Progress in Dart.
4. **Dispatch** — fetch task full detail, spawn `dartai:task-executor` subagent.
5. **Execute (subagent, fresh context)** — phases 0–9: understanding → impl → review → lint → test → LCI → refactor → cleanup → validation. Adversarial gates inside.
6. **Complete or block** — flip status, comment, release claim, push.
7. **Loop** — re-scan queue, fresh subagent for next task. Continues across failures.

### 4.2 Current dart-query usage (per task iteration)

| # | Call | Tool | Purpose |
|---|---|---|---|
| 1 | once per loop | `get_config` | Cache dartboards/assignees |
| 2 | per scan | `list_tasks(status=Todo, detail=minimal)` | Queue |
| 3 | per claim | `update_task(assignees=[runner], status=InProgress)` | UI claim |
| 4 | per dispatch | `get_task(include_relationships=true)` | Full spec |
| 5 | per phase milestone | `update_task(tags=[...])` | Phase tracking (2–3× per task) |
| 6 | per completion | `update_task(status=Done)` + `add_task_comment` | Close out |
| 7 | per failure | `update_task(status=Blocked, tags=['loop-blocked'])` + `create_task` (fix) | Replan |
| 8 | bulk loop end | `batch_update_tasks(selector=…)` | Phase rotation (already DartQL-shaped) |

**Per-task round-trip count: 5–8 dart-query calls.** None of them currently use DartQL (the loop-end batch is the only selector site, and uses the older `batch_update_tasks` rather than `execute_dartql`).

### 4.3 Friction surfaces

From the recon (R5 source recon, two parallel agents over `plugins/dartai/` and `~/work/mcps/dart-query/`):

| Friction | Detail | Selector-language fix |
|---|---|---|
| Repeated minimal fetches | `list_tasks` with same params twice per iteration (queue scan + post-completion re-scan) | Single `execute_dartql` SELECT with full claim filter; cache slice locally |
| Per-task tag updates | 2–3 `update_task` calls per task to advance phase tags | Batch tag rotation at loop end via DartQL UPDATE WHERE dart_id IN (…) |
| Sequential comment + status | `update_task` then `add_task_comment` as separate calls | `update_task` already supports inline `comment` field; or DartQL UPDATE … COMMENT 'X' |
| Always-full `get_task` at dispatch | `include_relationships=true` even when subagent only needs a slice | Defer relationship expansion to the subagent; pass minimal + dart_id |
| Dormant DartQL | `batch-operations.md` skill documents it; loop driver does not invoke it | Migrate `batch_update_tasks` calls to `execute_dartql` and add a queue-selector helper |

### 4.4 Modeled token impact

Per task, current shape: ~5–7 dart-query calls × ~150 tokens average response = **~750–1,050 tokens per task** in dart-query traffic alone (excludes the executor subagent's own work and `get_task(full)` which is ~600 tokens by itself, total ~1,400 tokens/task).

Migrated shape (Path A, no server change):

- 1 startup `get_config` (cached) — unchanged
- 1 `execute_dartql` SELECT for claim queue, returns ranked candidates
- 1 `update_task` for claim
- 1 `get_task(full)` for dispatch (or eliminated if executor re-fetches)
- 1 `update_task(status=Done, comment=…)` at completion (collapses tags + comment + status)
- 1 batched `execute_dartql` UPDATE for phase rotation, **once per loop end** (amortized)

**Per-task: ~3–4 calls, ~700–900 tokens.** The amortized batch at loop end converts N tag-rotation writes into one selector. **Conservative model: 30–40% reduction in dart-query token traffic, zero server changes.** Aggressive model (also defer dispatch fetch): 50%+.

These are estimates from call-shape and average response sizes, not measured production numbers. Path A requires no migration of the loop's logic — only its dart-query call sites — so an A/B with the model's existing telemetry is feasible inside one loop session.

---

## 5. When to Use a Query Language in an MCP

This is the framework half. The dartai workload is the case; the framework is what to take to other MCPs.

### 5.1 Use a query language when

- **The domain is relational.** Tasks, files, records, events, configs, logs — anything with fields, filters, joins, and bulk mutations.
- **Workflows naturally combine fetch → filter → mutate.** If callers consistently pull a list, narrow it client-side, then issue N mutations, that pattern compresses cleanly into a selector.
- **The verb count is climbing without cohering.** If you keep adding `get_X_by_Y_and_Z` tools, you're paving cowpaths a query language already paves.
- **The underlying API exposes filterable endpoints.** If the data plane already supports `?status=foo&assignee=bar`, half the language is free — the parser routes to native filters, only the gnarly operators fall back to client-side.
- **The caller is an LLM.** SQL-shaped DSLs are over-represented in pretraining. A novel custom DSL costs caller-side reasoning; SQL-92 WHERE is essentially free.

### 5.2 Don't use a query language when

- **The domain is RPC-shaped.** "Send this email," "render this PDF," "trigger this webhook" — there's nothing to filter. Verbs are correct.
- **The data plane has no filter layer.** If every selector forces a full table scan client-side, the query language is masking O(N) cost in O(1)-looking calls. Either add API-native filters first, or expose the cost (`dry_run`, scan-size warnings).
- **Mutation atomicity matters across rows.** SQL transactions exist; MCP query languages typically don't have them. `batch_update_tasks` is atomic per row, last-write-wins overall — fine for tagging and status, dangerous for accounting-style invariants.
- **The caller is a script with stable patterns.** If the same five queries run 99% of the time, just expose those five verbs. Query languages pay off under variability.

### 5.3 Design checklist if you do

| Concern | Handling |
|---|---|
| **Safety on destructive ops** | `dry_run` default true; `confirm` keyword required; preview rows in dry-run output |
| **Scan-size transparency** | Surface estimated/actual fetch size; warn when client-side filter dominates |
| **API-native vs. client-side split** | Document which fields/operators are which; make `EXPLAIN`-equivalent available |
| **Atomicity model** | Per-row, partial-failure, or all-or-nothing? Document it. `batch_operation_id` polling pattern is a reasonable default |
| **Concurrency cap** | Tunable, defaulted low; one runaway selector should not flood the upstream API |
| **Schema discoverability** | A discovery tool (`info`, `describe_fields`) that returns valid fields and operators — feed the LLM what it can do |
| **Template interpolation** | Separate values map from query string; prevents naive string concat and the SQL-injection-of-LLM-prompts equivalent |
| **Deprecation path** | Older verbs (`batch_update_tasks` → `execute_dartql`) should overlap, with deprecation notices in tool descriptions, not breaking removals |
| **LLM-friendly errors** | Parse errors should name the bad token, suggest valid neighbors, point to the field list |

### 5.4 Tradeoffs you own

- **Parser maintenance.** DartQL is 1,900 lines. That's a dialect to test, fuzz, and version. If your team can't carry that, use a smaller embedded language (JMESPath, JSONLogic, a structured filter object).
- **Caller learning curve.** Even SQL-shaped DSLs have quirks. Expect calling skills to need 1–2 worked examples per common shape. Build a `task-filtering`-style skill **before** advertising the language to callers.
- **Vendor neutrality.** Generic relational MCPs (dart-query, sqlite-mcp, db-mcp) stay generic. If you bake domain semantics into the query language (`CLAIM`, `RESERVE`, `ADVANCE_PHASE`), you've created a domain MCP wearing a query-language coat. That's fine, but name it as such.

---

## 6. Counterfactual: What Would the Loop Have Cost Without DartQL?

A dartai-shaped loop with a verb-only dart-query would need:

- `claim_for_loop(task_id, runner_id, loop_session_id)` — atomic mark
- `release_claim(task_id, runner_id)`
- `advance_phase(task_id, phase)` — one verb per phase, or a phase enum verb
- `mark_blocked(task_id, reason)`
- `complete_with_comment(task_id, comment)`
- `list_claimable_tasks(dartboard, runner_id)` — already filtered server-side

Each of those is plausible to add. Cost: ~6 new handlers in the monolithic `index.ts`, each with schema, tests, npm publish, version bump. Gain over status-quo Path A (DartQL adoption): atomic claim (real benefit), cleaner audit trail (real benefit), but three of the six are just selector-shaped operations that DartQL already handles. The case for verbs over selectors should rest on **atomicity guarantees the language can't express**, not on convenience — convenience is what the language is for.

This is the test: when proposing a new MCP verb, ask "could `execute_dartql` express this if the underlying API supported it?" If yes, the verb is paving over a missing data-plane feature. Fix the data plane or accept the client-side cost. If no — atomicity, transactional invariants, side effects beyond the data store — the verb is real.

---

## 7. Recommendations Beyond dartai

For future MCPs in this marketplace and elsewhere:

1. **Default to a query language for relational domains.** Start with `list_X(filter=…)` and `execute_X_query` early; let verbs accrete only where they add atomicity.
2. **Make `dry_run` the default on writes.** The pattern works. Adopt it.
3. **Ship a filtering skill alongside the MCP.** dartai's `batch-operations.md` and `task-filtering.md` are the right shape — examples, footguns, escape valves. Without them, callers default to verbs.
4. **Surface the API-native / client-side split explicitly.** Either in tool docs or in a `dartql_explain` tool. Hidden client-side scans are the worst kind of cost.
5. **Treat selector adoption as a measured migration.** Path A in the dartai case is a 30–50% token win with zero server change. The blocker is not capability; it's that callers reach for the verb they already know. Migration is a documentation and skill-rewriting effort, not an engineering effort.
6. **Resist domain semantics in the language.** Keep DartQL relational; layer dartai-specific verbs (`claim_task`, `advance_phase`) above it as a separate MCP or as additive verbs in the same MCP, clearly namespaced. This preserves dart-query's reusability for non-dartai callers.

---

## 8. Open Questions / Follow-ups

- **Measured A/B.** Run one dartai loop iteration with current call shape, one with Path A migration, compare token counts and wall-clock. The model in §4.4 wants real numbers behind it.
- **Atomicity primitive.** Does Dart's REST API support optimistic concurrency (ETag / If-Match)? If yes, dart-query can expose conditional updates without a server-side lock. If no, claim atomicity stays at the git-CAS layer.
- **`EXPLAIN` for DartQL.** Add a tool or flag that returns the API-native vs. client-side split for a given selector, plus an estimated scan size. Closes the §3.4 transparency gap.
- **Other domains.** Files (read+filter+rewrite), logs (query+aggregate), MCP catalogs (slop-mcp itself) — all candidates for the same treatment. This case study is one data point; the framework wants more.
- **Cross-MCP query.** If `dart-query` and `lci` both speak similar selectors, can a meta-MCP join across them ("tasks tagged X whose linked file has symbol Y")? Speculative, but the verbs-vs-language divide gets sharper when joins enter.

---

## 9. References

- `~/work/mcps/dart-query/src/parsers/dartql.ts` — language source.
- `~/work/mcps/dart-query/src/tools/execute_dartql.ts`, `batch_update_tasks.ts`, `batch_delete_tasks.ts` — query-driven tool handlers.
- `plugins/dartai/commands/start.md` — loop driver.
- `plugins/dartai/skills/adversarial-quality-loop.md` — phase framework.
- `plugins/dartai/skills/batch-operations.md`, `task-filtering.md` — caller-side skill docs.
- Anthropic, [Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), 2025 — alternative diagnosis (replace tools with code APIs).
- Anthropic, [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), 2025 — token-cost framing.
- [MCP Architecture](https://modelcontextprotocol.io/docs/learn/architecture) — protocol baseline.

---

**Status note:** this is a draft case study, not a binding architectural rule. R5's purpose is to give future MCP design conversations a shared reference and a measured opinion. The next step is the §8 A/B measurement — until that ships, the §4.4 numbers are model estimates.
