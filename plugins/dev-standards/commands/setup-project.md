---
name: setup-project
description: Set up project with dev standards — rules, skills, and hooks
---

Set up development standards for this project by detecting the tech stack, interviewing the user, and generating contextual rules and skills into `.claude/rules/` and `.claude/skills/`.

All template files are located at `${CLAUDE_PLUGIN_ROOT}/assets/templates/`.

## Phase 1 -- Auto-Detection

Scan the project automatically. Do NOT ask the user anything yet.

### Language and Framework Detection

Use Glob to check for the presence of these files:

- `package.json` -- Node.js / JavaScript / TypeScript
- `tsconfig.json` or `**/*.ts` -- TypeScript confirmation
- `*.csproj` or `*.sln` -- C# / .NET
- `go.mod` -- Go
- `Cargo.toml` -- Rust
- `pyproject.toml`, `setup.py`, `requirements.txt` -- Python
- `Makefile` -- build system

### Framework Detection

Check for framework-specific config files:

- `next.config.*` -- Next.js
- `angular.json` -- Angular
- `vite.config.*` -- Vite
- `nuxt.config.*` -- Nuxt
- `svelte.config.*` -- SvelteKit
- `astro.config.*` -- Astro
- `remix.config.*` -- Remix
- `gatsby-config.*` -- Gatsby
- `Program.cs` with `WebApplication` -- ASP.NET
- `serverless.yml` or `serverless.ts` -- Serverless Framework
- `sam-template.yaml` or `template.yaml` -- AWS SAM
- `cdk.json` -- AWS CDK
- `terraform` directory -- Terraform
- `Dockerfile` -- Containerized
- `docker-compose*.yml` -- Docker Compose

### Test Runner Detection

Check for test configuration files:

- `jest.config.*` or `"jest"` key in `package.json` -- Jest
- `vitest.config.*` -- Vitest
- `pytest.ini`, `pyproject.toml` with `[tool.pytest]` -- pytest
- `xunit` or `nunit` references in `*.csproj` -- .NET test frameworks
- `*_test.go` files -- Go testing
- `playwright.config.*` -- Playwright
- `cypress.config.*` -- Cypress

### Linter and Formatter Detection

Check for:

- `.eslintrc*` or `eslint.config.*` -- ESLint
- `.prettierrc*` or `prettier.config.*` -- Prettier
- `biome.json` -- Biome
- `.editorconfig` -- EditorConfig
- `ruff.toml` or `[tool.ruff]` in `pyproject.toml` -- Ruff
- `.golangci.yml` -- golangci-lint
- `rustfmt.toml` -- rustfmt

### Existing Configuration Detection

Check for:

- `.claude/` directory -- existing Claude configuration
- `.claude/rules/` -- existing rules
- `.claude/skills/` -- existing skills
- `CLAUDE.md` -- existing project instructions

### Persistence Detection

Check for:

- `prisma/` or `schema.prisma` -- Prisma ORM
- `**/migrations/` directory -- database migrations
- `docker-compose*.yml` with database service names (postgres, mysql, redis, mongo)
- `*.entity.ts`, `*.model.ts`, `**/models/`, `**/entities/` -- ORM entities
- `knexfile.*` -- Knex
- `drizzle.config.*` -- Drizzle
- `sequelize` in `package.json` -- Sequelize
- `alembic/` or `alembic.ini` -- Alembic (Python)
- `Entity Framework` references in `*.csproj` -- EF Core

Collect all findings into a detection summary. Proceed to Phase 2.

## Phase 2 -- Confirm and Classify

Present the detection summary to the user in a clear format:

```
Detected:
  Languages: [list]
  Frameworks: [list]
  Test runners: [list]
  Linters: [list]
  Persistence: [list]
  Existing config: [list or "none"]
```

Then ask ONE question at a time. Wait for each answer before asking the next.

### Question 1: Confirm Detection

Ask the user to confirm the detected languages and frameworks. Ask if anything is missing or incorrect.

### Question 2: Project Type

Ask the user to pick the project type:

- **script** -- One-off or scheduled script
- **CLI** -- Command-line tool
- **library** -- Reusable package/library
- **desktop** -- Desktop application (Photino or similar)
- **web app** -- Web application (frontend, backend, or full-stack)
- **SaaS** -- Multi-tenant SaaS product
- **serverless** -- Serverless functions / Lambda

### Question 3: Architecture Style

Ask the user to pick the architecture style:

- **simple** -- Flat structure, minimal abstraction
- **CRUD** -- Standard CRUD with service layer
- **DDD** -- Domain-driven design with aggregates and bounded contexts
- **event-driven** -- Event sourcing, message queues, pub/sub
- **microservices** -- Distributed services with independent deployment

### Question 4: Deployment Target

Ask the user to pick the deployment target:

- **local-only** -- Runs locally, no deployment
- **container** -- Docker / Kubernetes
- **serverless** -- Lambda / Cloud Functions / Azure Functions
- **edge** -- Edge runtime (Cloudflare Workers, Deno Deploy, Vercel Edge)
- **desktop** -- Desktop distribution

## Phase 3 -- External Dependencies

Ask the user about external dependencies. Ask ONE question at a time.

### Question 5: Databases and Storage

Ask what databases or storage systems the project uses (if any). Examples: PostgreSQL, MySQL, MongoDB, Redis, S3, SQLite. Skip if no persistence was detected and user confirms none.

### Question 6: External APIs

Ask what external APIs or third-party services the project integrates with (if any). Examples: Stripe, Auth0, SendGrid, OpenAI, AWS services.

### Question 7: Replay Proxies

If external APIs were listed, ask which ones need replay proxies for testing. Explain briefly: replay proxies record real API responses and replay them in CI so tests are fast and deterministic.

## Phase 4 -- Project Context

Ask the user for project context. Ask ONE question at a time.

### Question 8: Project Description

Ask for a brief (1-3 sentence) description of what the project does.

### Question 9: Domain Concepts

Ask for key domain concepts or terms that are important for understanding the codebase. Examples: "tenant", "workspace", "pipeline", "widget". Skip if the user says none.

### Question 10: Team Conventions

Ask if there are any team conventions or patterns that should be documented. Examples: "we use barrel exports", "all API responses use a wrapper type", "we prefix interfaces with I". Skip if the user says none.

## Phase 5 -- Output Generation

Generate all output files. Read each template from `${CLAUDE_PLUGIN_ROOT}/assets/templates/` before copying.

Every generated file MUST start with this comment on the first line:

```
<!-- Generated by dev-standards plugin. Customize as needed. -->
```

If a template already includes this comment, do not duplicate it.

### Step 1: Create Directories

Create `.claude/rules/` and `.claude/skills/` directories if they do not exist.

```bash
mkdir -p .claude/rules .claude/skills
```

### Step 2: Copy Always-Loaded Rules

Read and copy these templates to `.claude/rules/`:

- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/version-control.md` -> `.claude/rules/version-control.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/code-quality.md` -> `.claude/rules/code-quality.md`

Copy them as-is. They have no placeholders that need filling.

### Step 3: Generate Architecture Rule

Read `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/architecture.md`. Replace these placeholders with values from the interview:

- `{{project_type_description}}` -- Replace with the project type and architecture style. Example: "Web application using DDD architecture, deployed to containers."
- `{{active_decisions}}` -- Replace with "No active architecture decisions documented yet. Add decisions here as they are made." (The user will fill this in over time.)
- `{{active_migrations}}` -- Replace with "No active migrations. Document ongoing migrations here." (The user will fill this in over time.)
- `{{project_constraints}}` -- Replace with deployment target and any team conventions mentioned. Example: "Deployed to Kubernetes. All API responses use a standard wrapper type."

Write the result to `.claude/rules/architecture.md`.

### Step 4: Copy Language-Specific Rules

For each detected language, read the corresponding template and copy it to `.claude/rules/`:

| Language   | Template file   | Output file                   |
|------------|----------------|-------------------------------|
| TypeScript | `typescript.md` | `.claude/rules/typescript.md` |
| C#         | `csharp.md`     | `.claude/rules/csharp.md`     |
| Python     | `python.md`     | `.claude/rules/python.md`     |
| Go         | `go.md`         | `.claude/rules/go.md`         |
| Rust       | `rust.md`       | `.claude/rules/rust.md`       |

Copy each as-is. The templates already include correct glob paths in their frontmatter.

### Step 5: Generate Testing Rule

If any test runner was detected, read `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/testing.md` and replace these placeholders:

- `{{test_runner}}` -- The detected or confirmed test runner (e.g., "vitest", "jest", "pytest", "go test")
- `{{e2e_framework}}` -- The detected e2e framework (e.g., "playwright", "cypress"). If none detected, use "not configured"
- `{{replay_proxy}}` -- The replay proxy tool if specified by the user, otherwise "not configured"
- `{{external_services}}` -- The external services that need replay proxies, or "none configured"

Write the result to `.claude/rules/testing.md`.

### Step 6: Copy Data Integrity Rule

If persistence was detected (databases, ORMs, migrations), read and copy `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/data-integrity.md` to `.claude/rules/data-integrity.md`.

Update the `paths` frontmatter to match the project's actual directory structure for database-related code. For example, if the project uses `src/db/` instead of `db/`, adjust accordingly.

### Step 7: Copy Skill Templates

Based on the project type, read and copy skill templates to `.claude/skills/`. Replace all `{{placeholders}}` in each skill with values from the interview.

Common placeholders across skills:

- `{{framework}}` -- The primary framework (e.g., "Next.js", "ASP.NET", "FastAPI")
- `{{test_runner}}` -- The test runner command
- `{{e2e_framework}}` -- The e2e framework
- `{{api_style}}` -- "REST" or "GraphQL" (infer from detection or ask)
- `{{validation_library}}` -- Detected validation library or "project's validation approach"
- `{{auth_pattern}}` -- "middleware auth" or "decorator auth" or similar (infer from detection)
- `{{orm}}` -- The detected ORM or "repository pattern"

Project type to skill mapping:

| Project Type | Skills to Copy |
|-------------|---------------|
| web app     | `webapp/add-endpoint`, `webapp/add-page`, `webapp/add-data-model` |
| SaaS        | `webapp/add-endpoint`, `webapp/add-page`, `webapp/add-data-model` |
| serverless  | `serverless/add-function` |
| CLI         | `cli/add-command` |
| library     | `library/add-public-api` |
| desktop     | `desktop/add-message` |
| script      | (no skills) |

If the architecture style is DDD, also copy `ddd/add-aggregate` and `ddd/add-domain-event` in addition to the project type skills.

For each skill, create the directory and copy the file:

```
.claude/skills/<skill-name>/SKILL.md
```

For example, `webapp/add-endpoint/SKILL.md` becomes `.claude/skills/add-endpoint/SKILL.md`.

### Step 8: Generate CLAUDE.md

Generate a thin `.claude/CLAUDE.md` file. This file provides project context to Claude without duplicating rule content.

```markdown
<!-- Generated by dev-standards plugin. Customize as needed. -->

# Project

{{project_description}}

## Type

{{project_type}} / {{architecture_style}} / {{deployment_target}}

## Key Technologies

{{comma-separated list of languages, frameworks, and key tools}}

## Domain Concepts

{{domain_concepts or "No domain concepts documented yet."}}

## Team Conventions

{{team_conventions or "No team conventions documented yet."}}

## Rules

Project rules are loaded automatically from `.claude/rules/`. See that directory for active standards.

## Skills

Project skills are loaded automatically from `.claude/skills/`. See that directory for available workflows.
```

Replace all `{{placeholders}}` with actual values from the interview.

### Step 9: Handle Existing Configuration

If `.claude/` already existed:

- Do NOT overwrite any existing files without asking the user first
- For each file that would conflict, ask the user whether to overwrite, skip, or merge
- If `CLAUDE.md` already exists at the project root, do not touch it -- only generate `.claude/CLAUDE.md`

## Completion

After generating all files, present a summary:

```
Setup complete. Generated files:

Rules (loaded automatically by Claude):
  .claude/rules/version-control.md
  .claude/rules/code-quality.md
  .claude/rules/architecture.md
  .claude/rules/<language>.md (for each language)
  .claude/rules/testing.md (if tests detected)
  .claude/rules/data-integrity.md (if persistence detected)

Skills (available workflows):
  .claude/skills/<skill-name>/SKILL.md (for each skill)

Project context:
  .claude/CLAUDE.md

All files are customizable. Edit them to refine your project standards.
```
