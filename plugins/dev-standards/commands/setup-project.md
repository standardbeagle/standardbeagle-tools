---
name: setup-project
description: "Set up project with dev standards — rules, skills, and hooks. 配置項目以開發規範，立規則、技能、鉤子. Use when: setup dev standards, configure project rules, install dev hooks, bootstrap project standards, apply standard rules"
---

以下模板文件位於 `${CLAUDE_PLUGIN_ROOT}/assets/templates/`。

## Phase 1 -- Auto-Detection

自動掃描項目。此階段**不向用戶提問**。

### Language and Framework Detection

用 Glob 檢查以下文件是否存在：

- `package.json` -- Node.js / JavaScript / TypeScript
- `tsconfig.json` or `**/*.ts` -- TypeScript confirmation
- `*.csproj` or `*.sln` -- C# / .NET
- `go.mod` -- Go
- `Cargo.toml` -- Rust
- `pyproject.toml`, `setup.py`, `requirements.txt` -- Python
- `Makefile` -- build system

### Framework Detection

檢查框架專屬配置文件：

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

檢查測試配置文件：

- `jest.config.*` or `"jest"` key in `package.json` -- Jest
- `vitest.config.*` -- Vitest
- `pytest.ini`, `pyproject.toml` with `[tool.pytest]` -- pytest
- `xunit` or `nunit` references in `*.csproj` -- .NET test frameworks
- `*_test.go` files -- Go testing
- `playwright.config.*` -- Playwright
- `cypress.config.*` -- Cypress

### Linter and Formatter Detection

檢查：

- `.eslintrc*` or `eslint.config.*` -- ESLint
- `.prettierrc*` or `prettier.config.*` -- Prettier
- `biome.json` -- Biome
- `.editorconfig` -- EditorConfig
- `ruff.toml` or `[tool.ruff]` in `pyproject.toml` -- Ruff
- `.golangci.yml` -- golangci-lint
- `rustfmt.toml` -- rustfmt

### Existing Configuration Detection

檢查：

- `.claude/` directory -- existing Claude configuration
- `.claude/rules/` -- existing rules
- `.claude/skills/` -- existing skills
- `CLAUDE.md` -- existing project instructions

### Persistence Detection

檢查：

- `prisma/` or `schema.prisma` -- Prisma ORM
- `**/migrations/` directory -- database migrations
- `docker-compose*.yml` with database service names (postgres, mysql, redis, mongo)
- `*.entity.ts`, `*.model.ts`, `**/models/`, `**/entities/` -- ORM entities
- `knexfile.*` -- Knex
- `drizzle.config.*` -- Drizzle
- `sequelize` in `package.json` -- Sequelize
- `alembic/` or `alembic.ini` -- Alembic (Python)
- `Entity Framework` references in `*.csproj` -- EF Core

匯總所有發現為檢測摘要，進入 Phase 2。

## Phase 2 -- Confirm and Classify

向用戶呈現檢測摘要：

```
Detected:
  Languages: [list]
  Frameworks: [list]
  Test runners: [list]
  Linters: [list]
  Persistence: [list]
  Existing config: [list or "none"]
```

逐一提問，待答後方問下一問。

### Question 1: Confirm Detection

詢問用戶確認已檢測到的語言與框架。詢問是否有遺漏或錯誤。

### Question 2: Project Type

詢問用戶選擇項目類型：

- **script** -- One-off or scheduled script
- **CLI** -- Command-line tool
- **library** -- Reusable package/library
- **desktop** -- Desktop application (Photino or similar)
- **web app** -- Web application (frontend, backend, or full-stack)
- **SaaS** -- Multi-tenant SaaS product
- **serverless** -- Serverless functions / Lambda

### Question 3: Architecture Style

詢問用戶選擇架構風格：

- **simple** -- Flat structure, minimal abstraction
- **CRUD** -- Standard CRUD with service layer
- **DDD** -- Domain-driven design with aggregates and bounded contexts
- **event-driven** -- Event sourcing, message queues, pub/sub
- **microservices** -- Distributed services with independent deployment

### Question 4: Deployment Target

詢問用戶選擇部署目標：

- **local-only** -- Runs locally, no deployment
- **container** -- Docker / Kubernetes
- **serverless** -- Lambda / Cloud Functions / Azure Functions
- **edge** -- Edge runtime (Cloudflare Workers, Deno Deploy, Vercel Edge)
- **desktop** -- Desktop distribution

### Question 4b: TDD Discipline

詢問用戶是否需要強制嚴格 TDD 紀律：

- **strict** -- RED/GREEN/REFACTOR cycle enforced, vertical slices required, test distribution targets
- **standard** -- Testing required but TDD cycle not strictly enforced
- **minimal** -- Tests recommended but not mandatory (scripts, prototypes)

Web app、SaaS、library、DDD 項目默認 **strict**。CLI 與 serverless 默認 **standard**。腳本默認 **minimal**。

### Question 4c: Documentation Level

詢問用戶生成何種文檔：

- **full** -- User stories, user flows, tech specs, ADRs, API docs, changelog
- **standard** -- Tech specs, API docs, changelog (no formal user stories/flows)
- **minimal** -- Changelog only

DDD、SaaS、web app 默認 **full**。library 與 CLI 默認 **standard**。腳本默認 **minimal**。

## Phase 3 -- External Dependencies

詢問用戶外部依賴，逐一提問。

### Question 5: Databases and Storage

詢問項目使用哪些數據庫或存儲系統（如有）。示例：PostgreSQL, MySQL, MongoDB, Redis, S3, SQLite。若未檢測到持久化且用戶確認無需，跳過。

### Question 6: External APIs

詢問項目集成哪些外部 API 或第三方服務（如有）。示例：Stripe, Auth0, SendGrid, OpenAI, AWS services。

### Question 7: Replay Proxies

若列出了外部 API，詢問哪些需要 replay proxy 用於測試。簡述：replay proxy 記錄真實 API 響應並在 CI 中回放，使測試快速且確定。

## Phase 4 -- Project Context

詢問用戶項目上下文，逐一提問。

### Question 8: Project Description

詢問項目功能的簡短描述（1-3 句）。

### Question 9: Domain Concepts

詢問對理解代碼庫重要的核心領域概念或術語。示例：「tenant」、「workspace」、「pipeline」、「widget」。若用戶稱無，跳過。

### Question 10: Team Conventions

詢問是否有需要記錄的團隊慣例或模式。示例：「we use barrel exports」、「all API responses use a wrapper type」、「we prefix interfaces with I」。若用戶稱無，跳過。

## Phase 5 -- Output Generation

生成所有輸出文件。寫入前從 `${CLAUDE_PLUGIN_ROOT}/assets/templates/` 讀取每個模板。

每個生成文件**必須**以此注釋起首：

```
<!-- Generated by dev-standards plugin. Customize as needed. -->
```

若模板已含此注釋，不重複添加。

### Step 1: Create Directories

若 `.claude/rules/` 與 `.claude/skills/` 目錄不存在則創建：

```bash
mkdir -p .claude/rules .claude/skills
```

### Step 2: Copy Always-Loaded Rules

讀取以下模板並複製到 `.claude/rules/`：

- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/version-control.md` -> `.claude/rules/version-control.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/code-quality.md` -> `.claude/rules/code-quality.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/karpathy-principles.md` -> `.claude/rules/karpathy-principles.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/refactor-discipline.md` -> `.claude/rules/refactor-discipline.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/grill-intake.md` -> `.claude/rules/grill-intake.md`

原樣複製。無需填充佔位符。

### Step 3: Generate Architecture Rule

讀取 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/architecture.md`。以訪談中的值替換以下佔位符：

- `{{project_type_description}}` — 替換為項目類型與架構風格。例：「Web application using DDD architecture, deployed to containers.」
- `{{active_decisions}}` — 替換為「No active architecture decisions documented yet. Add decisions here as they are made.」（用戶隨時間填充）
- `{{active_migrations}}` — 替換為「No active migrations. Document ongoing migrations here.」（用戶隨時間填充）
- `{{project_constraints}}` — 替換為部署目標及任何提及的團隊慣例。例：「Deployed to Kubernetes. All API responses use a standard wrapper type.」

將結果寫入 `.claude/rules/architecture.md`。

### Step 4: Copy Language-Specific Rules

對每種檢測到的語言，讀取對應模板並複製到 `.claude/rules/`：

| Language   | Template file   | Output file                   |
|------------|----------------|-------------------------------|
| TypeScript | `typescript.md` | `.claude/rules/typescript.md` |
| C#         | `csharp.md`     | `.claude/rules/csharp.md`     |
| Python     | `python.md`     | `.claude/rules/python.md`     |
| Go         | `go.md`         | `.claude/rules/go.md`         |
| Rust       | `rust.md`       | `.claude/rules/rust.md`       |

原樣複製。模板 frontmatter 中已含正確 glob 路徑。

### Step 5: Generate Testing Rule

若檢測到任何測試運行器，讀取 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/testing.md` 並替換以下佔位符：

- `{{test_runner}}` — 已檢測或確認的測試運行器（如「vitest」、「jest」、「pytest」、「go test」）
- `{{e2e_framework}}` — 已檢測到的 e2e 框架（如「playwright」、「cypress」）。若未檢測到，使用「not configured」
- `{{replay_proxy}}` — 用戶指定的 replay proxy 工具，否則使用「not configured」
- `{{external_services}}` — 需要 replay proxy 的外部服務，或「none configured」

將結果寫入 `.claude/rules/testing.md`。

### Step 6: Copy Data Integrity Rule

若檢測到持久化（數據庫、ORM、遷移），讀取並複製 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/data-integrity.md` 到 `.claude/rules/data-integrity.md`。

更新 `paths` frontmatter 以匹配項目實際的數據庫相關代碼目錄結構。例如，若項目使用 `src/db/` 而非 `db/`，相應調整。

### Step 6b: Generate TDD Rule

若 TDD 紀律為 **strict** 或 **standard**，讀取 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/tdd.md` 並複製到 `.claude/rules/tdd.md`。

若 TDD 紀律為 **standard**，在頂部添加注釋：「TDD cycle is recommended but not strictly enforced for this project.」

若 TDD 紀律為 **minimal**，跳過此規則。

### Step 6c: Generate DDD Rule

若架構風格為 **DDD** 或 **event-driven**，讀取 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/ddd.md` 並複製到 `.claude/rules/ddd.md`。

### Step 6d: Generate Documentation Rule

若文檔級別為 **full** 或 **standard**，讀取 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/documentation.md` 並複製到 `.claude/rules/documentation.md`。

若文檔級別為 **standard**，從生成文件中移除「User Stories」和「User Flows」節（這兩節僅用於 **full** 級別）。

### Step 6e: Copy Risk Pipeline Config

讀取 `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/risk.md` 並複製到 `.claude/rules/risk.md`。

**僅當目標文件不存在時寫入**——風險管道配置為項目可覆寫模板，既存文件保留用戶定制。此行為獨立於 Step 9（其覆蓋全目錄衝突策略）；風險配置默認絕不覆寫。

另追加 `.risk-pipeline/` 至項目根 `.gitignore`（若 `.gitignore` 存在且未含此行）。此目錄存遙測 jsonl，默認不入版本。若 `.gitignore` 不存在，跳過——不為此創建文件。

若用戶明表欲將遙測入版本（罕見），跳過 `.gitignore` 追加並在完成摘要中提示。

### Step 7: Copy Skill Templates

依項目類型，讀取並複製技能模板到 `.claude/skills/`。以訪談中的值替換每個技能中的所有 `{{placeholders}}`。

技能通用佔位符：

- `{{framework}}` — 主框架（如「Next.js」、「ASP.NET」、「FastAPI」）
- `{{test_runner}}` — 測試運行器命令
- `{{e2e_framework}}` — e2e 框架
- `{{api_style}}` — 「REST」或「GraphQL」（從檢測推斷或詢問）
- `{{validation_library}}` — 已檢測到的驗證庫或「project's validation approach」
- `{{auth_pattern}}` — 「middleware auth」或「decorator auth」或類似（從檢測推斷）
- `{{orm}}` — 已檢測到的 ORM 或「repository pattern」

項目類型與技能映射：

| Project Type | Skills to Copy |
|-------------|---------------|
| web app     | `webapp/add-endpoint`, `webapp/add-page`, `webapp/add-data-model` |
| SaaS        | `webapp/add-endpoint`, `webapp/add-page`, `webapp/add-data-model` |
| serverless  | `serverless/add-function` |
| CLI         | `cli/add-command` |
| library     | `library/add-public-api` |
| desktop     | `desktop/add-message` |
| script      | (no skills) |

若架構風格為 DDD 或 event-driven，同時複製：
- `ddd/add-aggregate`, `ddd/add-domain-event`（實現技能）
- `ddd/define-context`, `ddd/spec-domain`（設計技能）
- `ddd/domain-init`, `ddd/domain-update`, `ddd/domain-check`, `ddd/domain-split`（領域模型技能）

TDD 紀律與技能映射：

| TDD Level | Skills to Copy |
|-----------|---------------|
| strict    | `tdd/implement-slice` |
| standard  | `tdd/implement-slice` |
| minimal   | (no TDD skill) |

文檔級別與技能映射：

| Doc Level | Skills to Copy |
|-----------|---------------|
| full      | `docs/write-user-story`, `docs/define-user-flow`, `docs/write-tech-spec` |
| standard  | `docs/write-tech-spec` |
| minimal   | (no doc skills) |

每個技能，創建目錄並複製文件：

```
.claude/skills/<skill-name>/SKILL.md
```

例如，`webapp/add-endpoint/SKILL.md` 成為 `.claude/skills/add-endpoint/SKILL.md`。

### Step 8: Generate CLAUDE.md

生成精簡的 `.claude/CLAUDE.md` 文件。此文件為 Claude 提供項目上下文，不重複規則內容。

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

以訪談中的實際值替換所有 `{{placeholders}}`。

### Step 9: Handle Existing Configuration

若 `.claude/` 已存在：

- 不覆蓋任何現有文件，除非事先詢問用戶
- 對每個衝突文件，詢問用戶是覆蓋、跳過還是合併
- 若項目根目錄已有 `CLAUDE.md`，不觸動它——僅生成 `.claude/CLAUDE.md`

## Completion

生成所有文件後，呈現摘要：

```
Setup complete. Generated files:

Rules (loaded automatically by Claude):
  .claude/rules/version-control.md
  .claude/rules/code-quality.md
  .claude/rules/architecture.md
  .claude/rules/<language>.md (for each language)
  .claude/rules/testing.md (if tests detected)
  .claude/rules/tdd.md (if TDD strict or standard)
  .claude/rules/data-integrity.md (if persistence detected)
  .claude/rules/ddd.md (if DDD or event-driven architecture)
  .claude/rules/documentation.md (if docs full or standard)
  .claude/rules/risk.md (risk-pipeline config, never overwritten)

Skills (available workflows):
  .claude/skills/<skill-name>/SKILL.md (for each skill)
  Including: implement-slice, define-context, spec-domain,
  domain-init, domain-update, domain-check, domain-split,
  write-user-story, define-user-flow, write-tech-spec (based on selections)

Project context:
  .claude/CLAUDE.md

All files are customizable. Edit them to refine your project standards.
```
