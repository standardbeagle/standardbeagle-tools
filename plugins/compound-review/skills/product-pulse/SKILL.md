---
name: product-pulse
description: "Time-windowed pulse report on user experience and product performance — usage, quality, errors, signals worth investigating. Use when: 'run a pulse', 'show me the pulse', 'how are we doing', 'weekly recap', 'launch-day check', or window arg like '24h'/'7d'. Configures via .compound-engineering/config.local.yaml, saves to docs/pulse-reports/."
disable-model-invocation: true
argument-hint: "[lookback window, e.g. '24h', '7d', '1h'; default 24h]"
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
---

# Product Pulse

`product-pulse` queries data sources for given time window, produces compact single-page report covering usage, performance, errors, followups. Report saved to `docs/pulse-reports/`. Key points surfaced in chat.

Skill does not mutate product, database, or external system. Only writes: pulse settings appended to `.compound-engineering/config.local.yaml` (unified local config, gitignored, machine-local) and report file. MCP and other data-source tools invoked read-only — if tool offers write modes, do not use.

## Interaction Method

Default: `AskUserQuestion` (Claude Code). Call `ToolSearch` with `select:AskUserQuestion` first if schema not loaded. Fallback: numbered options in chat if blocking tool errors. Never silently skip the question.

One question at a time. Multi-select reserved for first-run config.

## Lookback Window

<lookback> #$ARGUMENTS </lookback>

Argument = time window. Common forms:
- `24h`, `48h`, `72h` — trailing hours
- `7d`, `30d` — trailing days
- `1h` — short-window (launches)

Empty arg → default to `pulse_lookback_default` from config (resolved Phase 0); unset there → hard default `24h`. Unparseable → ask user to clarify.

Apply **15-minute trailing buffer** to upper bound. Many analytics/tracing tools have ingestion lag; querying right up to `now` under-reports recent events. `24h` window → query `[now - 24h - 15m, now - 15m]`.

## Core Principles

1. **Read it like a founder.** No hardcoded thresholds. Don't label "bad"/"good" by default — present numbers, let reader judge.
2. **Single page.** Target 30-40 lines terminal output. Long → cut.
3. **No PII in saved reports.** No user emails, account IDs, message content.
4. **Parallel where safe, serial where it matters.** Analytics + tracing run parallel. DB queries serial to avoid load.
5. **Memory through saved reports.** Every run writes `docs/pulse-reports/` — past pulses browseable timeline.
6. **Read-only DB access only.** If DB used, connection must be read-only. Interview refuses read-write creds. DB optional — many products complete pulse with analytics + tracing alone.
7. **Strategy-seeded when available.** `STRATEGY.md` exists → interview reads it before asking questions, carries forward product name and key metrics as seeds. Goal of data-source setup: wire connections to actually measure those metrics.

## Execution Flow

### Phase 0: Route by Config State

**Config (pre-resolved):**
!`(top=$(git rev-parse --show-toplevel 2>/dev/null); [ -n "$top" ] && cat "$top/.compound-engineering/config.local.yaml" 2>/dev/null) || echo '__NO_CONFIG__'`

YAML key-value pairs → extract `pulse_*` keys (see "Config keys" below).
`__NO_CONFIG__` → file missing → first run.
Unresolved command string → read `.compound-engineering/config.local.yaml` from repo root via native file-read. Missing → first run.

**Config keys:**
- `pulse_product_name` — string, used in titles. Required for routing: unset = unconfigured.
- `pulse_lookback_default` — `1h`/`24h`/`7d`/`30d` (default `24h`)
- `pulse_primary_event` — engagement event name
- `pulse_value_event` — value-realization event name
- `pulse_completion_events` — comma-separated 0-3 event names
- `pulse_quality_scoring` — `true`/default `false` (AI products only)
- `pulse_quality_dimension` — string scored 1-5 when `pulse_quality_scoring` true
- `pulse_analytics_source` — analytics provider (`posthog`, `mixpanel`, `custom`)
- `pulse_tracing_source` — tracing provider (`sentry`, `datadog`, `custom`)
- `pulse_payments_source` — payments provider (`stripe`, `custom`); omit if unused
- `pulse_db_enabled` — `true`/default `false`; `true` = read-only DB part of pulse
- `pulse_metric_sources` — comma-separated `metric=source` per-strategy-metric overrides (`retention_d7=posthog,nps=delighted`). Unlisted metrics fall back to `pulse_analytics_source` with `(default source)` marker.
- `pulse_pending_metrics` — comma-separated strategy-doc metrics awaiting instrumentation; rendered `no data` until lands.
- `pulse_excluded_metrics` — comma-separated strategy-doc metrics intentionally excluded; stays in `STRATEGY.md`, not surfaced in pulse.

**Routing:**
- `pulse_product_name` unset (or config missing) → first run → Phase 1 → Phase 2
- `pulse_product_name` set → skip to Phase 2

Argument `setup`/`reconfigure`/`edit config` → Phase 1 regardless.

### Phase 1: First-Run Interview

#### 1.0 Seed from strategy (if available)

Before any questions, read `STRATEGY.md` via native file-read. File exists → extract:
- Product name from `name` key in YAML frontmatter; fallback H1 title (strip trailing ` Strategy`, e.g. `# Spiral Strategy` → `Spiral`)
- Key metrics from `## Key metrics` section, one per line

Open interview surfacing extraction: announce strategy doc found, show seeded product name + metrics carrying into event/data setup, invite user to correct.

`STRATEGY.md` missing → note explicitly: no strategy doc on file, running setup from scratch, mention `strategy` skill can seed pulse later if run first.

#### 1.1 Interview

Read `references/interview.md`. Non-optional load — pushback rules, anti-patterns, metric-to-source mapping logic live there.

Interview order:
1. Product name (confirm or edit seeded value)
2. Primary engagement event
3. Value-realization event
4. Completions or conversions (0-3)
5. Quality scoring (opt-in, AI products only)
6. Data sources — wire connections per agreed metric/event. Nudge toward MCP. Reject read-write DB. DB entirely optional.
7. System performance — short recommended setup for top errors + latency. Users rarely have strong opinions; present defaults, accept.
8. Default lookback window

Apply pushback rules in `references/interview.md` per section. Treat every metric/event/signal against **SMART bar** (specific, measurable, actionable, relevant, timely) per "Overall Rules" — push back on vague, vanity, unactionable.

User offers read-write DB → refuse, offer alternatives in `references/interview.md` section 6.

Write captured config to `<repo-root>/.compound-engineering/config.local.yaml` as flat `pulse_*` keys per "Config file shape" in interview. Resolve repo root via `git rev-parse --show-toplevel`. Write logic: (1) file or dir missing → create `.compound-engineering/` and write YAML; (2) exists → merge new keys, preserving non-pulse keys (e.g., `work_delegate_*`) untouched. `.compound-engineering/config.local.yaml` not in `.gitignore` → offer to add entry before writing. Show resulting pulse block in chat, offer one round of edits.

After config written, run **scheduling recommendation** from `references/interview.md` section 9: offer recurring run setup. Accept yes/no/later. Yes → hand off to harness's scheduling primitive (in-plugin `schedule` skill if installed; otherwise note platform-specific options — cron, GitHub Actions, host automation — emit brief hint). Don't schedule inline. Proceed Phase 2.

### Phase 2: Run the Pulse

Phase 1 ran (first run or `setup`/`reconfigure`) → re-read `.compound-engineering/config.local.yaml` to pick up edits. Otherwise use Phase 0 extracted values. Apply hard defaults for unset (see Phase 0 "Config keys").

#### 2.1 Dispatch Queries

**Parallel** (different tools, no shared load):
- Product analytics query (primary event count, value-realization count, completions, conversion ratios) over window
- Application tracing query (error counts by category, latency distribution, top error signatures) over window
- Payments query if configured (new customers, churn, revenue delta) over window

**Serially** after parallel batch:
- Read-only DB queries. One at a time. Tight scoped queries only. Never full-table scans on large tables. Expensive query → skip, note "DB query skipped (estimated cost too high)".

#### 2.2 Optional: Sample Quality Scoring

`pulse_quality_scoring` true (AI products only) → sample up to 10 sessions/conversations from window, score each 1-5 on `pulse_quality_dimension`.

**Scoring discipline:** Default 4 or 5 when normal. Reserve 1-3 for clear failure (product gave wrong answer, user stuck, error surfaced). All sessions scoring 3 → bar too strict. All scoring 5 → bar too loose.

**No PII in score summary.** Capture count distribution (e.g. "8x 5, 1x 4, 1x 2") + short anonymized note on sessions scored below 4. No message content, no user identifiers.

#### 2.3 Assemble Report

Read `references/report-template.md`. Fill template with query results. Four sections in order:
1. **Headlines** — 2-3 lines summarizing window
2. **Usage** — primary engagement, value realization, completions, quality sample
3. **System performance** — latency (p50/p95/p99) + top 5 errors by count with one-line explanation
4. **Followups** — 1-5 things worth investigating

Total 30-40 lines. Thin section → leave thin, don't pad.

#### 2.4 Write Report

Save to `docs/pulse-reports/YYYY-MM-DD_HH-MM.md` using run's local time. Create `docs/pulse-reports/` if missing.

Surface Headlines + top Followup in chat. Provide full file path.

### Phase 3: Routine Hook

First-run setup already offered scheduling (Phase 1.1 end). Phase 3 lighter re-surface for ad-hoc runs:
- Argument was schedule keyword (`daily`/`hourly`/`weekly`) → note this run ad-hoc, suggest scheduling via harness primitive (`schedule` skill where present; otherwise platform-native).
- No schedule on file + third+ pulse run → mention once that scheduling available. Don't nag every run.

Never schedule automatically. Scheduling handoff requires explicit confirmation.

## What This Skill Does Not Do

- Doesn't report "what shipped." Shipped work lives in issue tracker + commit history. Pulse strictly about user experience + system performance.
- Doesn't set thresholds or alert. Reader interprets.
- Doesn't persist PII in saved reports.
- Doesn't mutate DB or external system. All queries read-only.
- Doesn't replace tracing dashboards or analytics tools. Consolidates single-page read; deep investigation uses native tools.

## Learn More

"Read like a founder" posture and single-page constraint deliberate. Dashboards with 40 metrics produce attention sprawl; one page with right four sections forces reader to notice what matters. Saved-reports folder = team working memory, not data warehouse — past pulses grepable, diffable, disposable.
