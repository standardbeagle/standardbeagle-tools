---
name: Decide
description: This skill should be used when the user asks to "record a decision", "add a decision", "add a migration", "complete a migration", "list decisions", "list migrations", "update architecture decisions", or "mark migration done". Provides guidance for managing architectural decisions and active migrations in `.claude/rules/architecture.md`.
---

# Decide

Manage the Active Architecture Decisions and Active Migrations sections of `.claude/rules/architecture.md`. Keeping these sections current prevents confusion from stale patterns and ensures all new code follows the latest conventions.

## Step 1 -- Check for architecture.md

Read `.claude/rules/architecture.md`. If the file does not exist, warn the user:

```
No .claude/rules/architecture.md found.
Run /setup-project first to generate rule files, then re-run this skill.
```

Stop here if the file is missing. Do not create it -- the setup-project command handles initial generation with proper project context.

## Step 2 -- Parse Current State

Read the file and extract the current entries from these two sections:

- **Active Architecture Decisions** -- lines matching `- DECISION: ...`
- **Active Migrations** -- lines matching `- REPLACING: ...`

Present the current state to the user:

```
Active Decisions:
  1. DECISION: Use Zod for all runtime validation (recorded 2025-11-15)
  2. DECISION: Prefer server actions over API routes for mutations (recorded 2025-12-01)

Active Migrations:
  1. REPLACING: Jest -> Vitest (started 2025-12-10)
  2. REPLACING: Prisma -> Drizzle (started 2026-01-05)

(none)  <-- if either section is empty
```

## Step 3 -- Ask What Operation to Perform

Ask the user which operation to perform:

- **Add a decision** -- record a new architectural choice
- **Add a migration** -- record an in-progress technology or pattern replacement
- **Complete a migration** -- mark a migration as finished and remove it
- **List current** -- just show the current state (already done in Step 2, confirm and stop)

Wait for the answer before proceeding.

## Step 4 -- Add a Decision

If the user chose "add a decision":

### 4a -- Ask What Was Decided

Ask the user: "What architectural decision was made?" Prompt for a concise 1-2 line description. Examples:

- "Use Zod for all runtime validation"
- "Prefer server actions over API routes for mutations"
- "All new services use gRPC, not REST"

### 4b -- Ask Why

Ask: "Why was this decided? (1 line)" This context helps future developers understand the reasoning.

### 4c -- Write the Entry

Add a new line to the `## Active Architecture Decisions` section of `.claude/rules/architecture.md`:

```
- DECISION: <description> (recorded <today's date>)
```

Use today's date in YYYY-MM-DD format.

If the user provided a reason, append it as a comment on the next line:

```
- DECISION: <description> (recorded <today's date>)
  <!-- Reason: <why> -->
```

## Step 5 -- Add a Migration

If the user chose "add a migration":

### 5a -- Ask What Is Being Replaced

Ask the user: "What is being replaced and what is it being replaced with?" Prompt for a concise format:

- "Jest -> Vitest"
- "REST endpoints -> gRPC services"
- "Class components -> functional components with hooks"

### 5b -- Ask Why

Ask: "Why is this migration happening? (1 line)"

### 5c -- Write the Entry

Add a new line to the `## Active Migrations` section of `.claude/rules/architecture.md`:

```
- REPLACING: <old> -> <new> (started <today's date>)
```

If the user provided a reason, append it as a comment on the next line:

```
- REPLACING: <old> -> <new> (started <today's date>)
  <!-- Reason: <why> -->
```

### 5d -- Warn About Impact

Remind the user:

```
IMPORTANT: While this migration is active, all new code must follow the NEW
pattern (<new>). Existing code using <old> should be migrated opportunistically.
Any rules referencing <old> should be updated to prefer <new>.
```

## Step 6 -- Complete a Migration

If the user chose "complete a migration":

### 6a -- Select Migration

If there is only one active migration, confirm it. If there are multiple, ask the user which one to complete. If there are none, report "No active migrations to complete" and stop.

### 6b -- Confirm Completion

Show the migration entry and ask: "Is this migration fully complete? All old usages have been replaced?"

### 6c -- Remove the Entry

Remove the `REPLACING:` line (and its comment line, if present) from the `## Active Migrations` section.

### 6d -- Optionally Record as Decision

Ask the user: "Record the result as an active decision? (e.g., 'Use Vitest for all tests')"

If yes, add a corresponding entry to the `## Active Architecture Decisions` section following the format in Step 4c.

### 6e -- Check for Stale Rules

Scan `.claude/rules/` for any rule files that reference the old technology from the completed migration. If found, report them:

```
These rule files may reference the old pattern and should be updated:
  - .claude/rules/testing.md (mentions "Jest")
```

## Step 7 -- Report

After any write operation, read back the modified sections of `.claude/rules/architecture.md` and present the updated state using the format from Step 2.
