# CLAUDE.md

本檔為 Claude Code (claude.ai/code) 操此 repo 之準繩。

## Repository Purpose

此乃 **Claude Code marketplace repository**，catalog version `1.8.1`，封裝布 24 plugins。二核心 MCP-backed plugins：

1. **agnt** (v0.9.0) - Browser superpowers: process management, reverse proxy, frontend debugging, sketch mode
2. **lci** (v0.5.0) - Lightning code intelligence: sub-millisecond semantic code search

餘皆 workflow/skill bundles：dartai, workflow, brainstorming, knowledge-hygiene, ux-design, ux-developer, mcp-architect, mcp-tester, dev-standards, photino, figma-query, color, typography, design-token, a11y-audit, image-processing, ideation, compound-review, research, slop-mcp, slop-coder, dart-query, prompt-engineer。真源：`.claude-plugin/marketplace.json`。

> **Note:** `tools` plugin（合 agnt+lci）昔有，commit `3581d1c` 已除。舊本地裝或報 "tools@standardbeagle-tools: Plugin tools not found in marketplace" — 以 `claude plugin uninstall tools@standardbeagle-tools` 卸之。

## Essential Resources

### Plugin Development
- **Plugin Marketplaces Guide**: https://code.claude.com/docs/en/plugin-marketplaces

### MCP (Model Context Protocol)
- **MCP Specification**: https://modelcontextprotocol.io/specification/2025-06-18
- **MCP Architecture**: https://modelcontextprotocol.io/docs/learn/architecture
- **Code Execution with MCP**: https://www.anthropic.com/engineering/code-execution-with-mcp
- **Long-Running Agent Harnesses**: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

## Marketplace Concepts

### What is a Marketplace?

**plugin marketplace** 者，Claude Code extensions 之 catalog 也。其職：
- 集中 plugin discovery
- version tracking 與 automatic updates
- 多 source types：local, GitHub, Git
- team-wide configuration management

### Distribution Flow

1. **Marketplace** (this repo) - 由 `marketplace.json` 列 plugins
2. **Plugin Source** - plugin files 所在：local directory, GitHub repo, Git URL
3. **Plugin Cache** - 安裝時 Claude Code 複 plugin 至 local cache
4. **MCP Servers** - plugins invoke 之外部 binaries/services（此 project 以 npx）

### Key Files

**`.claude-plugin/marketplace.json`** - Marketplace registry
```json
{
  "name": "standardbeagle-tools",
  "owner": { "name": "Standard Beagle" },
  "plugins": [
    {
      "name": "agnt",
      "source": "./plugins/agnt",
      "version": "0.7.12",
      "description": "...",
      // ... metadata
    }
  ]
}
```

**`plugins/<name>/.claude-plugin/plugin.json`** - Plugin manifest（auto-discovery：default folders 中 components 自動載入）
```json
{
  "name": "agnt",
  "version": "0.9.0",
  "description": "...",
  "author": { "name": "Standard Beagle" }
}
```

Default auto-discovery paths（無須明列）：
- `skills/<name>/SKILL.md` — skills as folders
- `commands/<name>.md` — flat command files (legacy; prefer `skills/`)
- `agents/<name>.md` — agent definitions
- `hooks/hooks.json` — event handlers
- `..mcp.json` — MCP server config (dotfile)
- `.lsp.json` — LSP server config
- `monitors/monitors.json` — background monitors
- `bin/` — executables
- `settings.json` — default settings

### The `strict` Field

**`strict: true` (default)**：Plugin 必有己之 `plugin.json`；Marketplace entry fields 與之 merge。  
**`strict: false`**：Plugin 可無 `plugin.json`；Marketplace entry 盡定義。

此 marketplace 用 `strict: true`（implicit default）— 各 plugin 各有 `plugin.json`。

## Architecture

### Marketplace Structure

```
.claude-plugin/
  └── marketplace.json          # Marketplace registry - defines all available plugins

plugins/
  ├── agnt/                     # Browser superpowers plugin (MCP-backed)
  │   ├── .claude-plugin/plugin.json
  │   ├── commands/             # Slash commands (e.g., /setup-project, /dev-proxy)
  │   ├── skills/<name>/SKILL.md # Skills as folders containing SKILL.md
  │   ├── agents/               # Specialized agents
  │   ├── hooks/hooks.json      # Session lifecycle hooks
  │   ├── scripts/              # Hook implementation scripts
  │   └── ..mcp.json[.disabled]  # MCP server config (disabled: managed via slop-mcp)
  │
  ├── lci/                      # Code intelligence plugin (MCP-backed)
  │   ├── .claude-plugin/plugin.json
  │   ├── commands/             # Slash commands (/search, /explore, /context)
  │   ├── skills/<name>/SKILL.md
  │   └── ..mcp.json[.disabled]
  │
  └── <other-plugins>/          # Skill/workflow bundles — same structure, no ..mcp.json
      ├── .claude-plugin/plugin.json
      ├── commands/ skills/<name>/SKILL.md agents/ hooks/
      └── (no ..mcp.json — pure skill bundles)
```

> **`..mcp.json.disabled`** 故意也。Plugin-bundled MCP configs 與此 project `slop-mcp` registration model 不合。Users 當由 slop-mcp register MCP servers，非 plugin-bundled configs。勿復啟以「fix」。例外：`slop-mcp` plugin 保持 `..mcp.json` active（entry-point server）。

### Plugin Architecture

各 plugin 形：
- **`.claude-plugin/plugin.json`** - metadata（name, version, author, keywords）
- **`.mcp.json`** - MCP server config，`npx @standardbeagle/<plugin>@latest mcp`
- **`commands/*.md`** - Slash commands
- **`skills/<name>/SKILL.md`** - Skills folders with SKILL.md entrypoint
- **`agents/*.md`** - Specialized agents for complex workflows

### MCP Server Integration

諸 plugin 皆用 **npx-based MCP servers**，取 published npm packages：
- `agnt` → `npx @standardbeagle/agnt@latest mcp`
- `lci` → `npx @standardbeagle/lci@latest mcp`

實 MCP server implementations 在別 repo：
- https://github.com/standardbeagle/agnt
- https://github.com/standardbeagle/lci

### Session Management (agnt plugin)

agnt plugin 以 `hooks/hooks.json` 具 **session lifecycle hooks**：
- **SessionStart** - init session tracking，connect agnt daemon
- **PreToolUse** - 每 tool use 前 heartbeat
- **PostToolUse** - track Write/Edit, Bash, Task, TodoWrite activity
- **ToolError** - log errors to session
- **Stop** - disconnect and cleanup
- **Notification** - forward notifications to browser

`plugins/agnt/scripts/` 內 scripts 行 session tracking, activity monitoring, browser notifications。

## Testing Plugins Locally

```bash
# Add marketplace from local directory
claude mcp add-dir /home/beagle/work/standardbeagle-tools

# Or test individual plugin
claude mcp add agnt --source ./plugins/agnt
claude mcp add lci --source ./plugins/lci
```

### Headless Skill Tests (`claude -p`)

`tests/` 有 non-interactive harness，以 `claude -p` 與 stream-json output 試 plugin commands/skills。見 `tests/README.md`。速行：

```bash
tests/run-start-tests.sh           # all probes
tests/run-start-tests.sh structure # JSON/markdown lint only
tests/run-start-tests.sh fallback  # Agent-disabled inline-delegation path
```

## Version Management

更新 plugin versions 時：
1. 改 `.claude-plugin/plugin.json` version
2. 改 `marketplace.json` plugins array version
3. 確 MCP servers 已 publish to npm 且 versions matching
4. 驗 `.mcp.json` 用 `@latest` 或 specific version tag

## Key Concepts

### Plugin vs MCP Server

- **Plugins** (this repo) - Metadata, commands, skills, agents, hooks
- **MCP Servers** (separate repos) - Actual tool implementations via MCP protocol

Plugins 為 lightweight wrappers，以 configure/integrate MCP servers into Claude Code。

### Commands vs Skills vs Agents

- **Commands** - User-invocable slash commands（如 `/dev-proxy`, `/search`）
- **Skills** - Specialized prompts/workflows，可 invoke
- **Agents** - Autonomous agents for complex multi-step tasks

## Plugin Development Guide

### Critical Concepts

#### Plugin Caching and File References

**CRITICAL**：Plugins 安裝時被複至 cache。故：
- ✅ Plugin files 必 self-contained within their directory
- ❌ 不可用 `../shared-utils` 等 relative paths 指 directory 外 files
- ✅ 若須共享 files，用 symlinks（copy 時 follow）
- ✅ 用 `${CLAUDE_PLUGIN_ROOT}` 參 plugin 內 files

**Example - Correct path usage:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "agnt": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/agnt@latest", "mcp"]
    }
  }
}
```

#### MCP Server Integration Patterns

此 marketplace 用 **npx-based MCP servers**，為：
- Automatic version management（`@latest` 得最新）
- No local installation required
- Cross-platform compatibility
- Clean separation of concerns

**Pattern used in this project:**
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@standardbeagle/package@latest", "mcp"],
      "env": {}
    }
  }
}
```

**Alternative patterns**（此處不用，然 valid）：
- Local binary: `"command": "${CLAUDE_PLUGIN_ROOT}/bin/server"`
- System binary: `"command": "my-mcp-server"`
- Python package: `"command": "uvx", "args": ["my-mcp-package"]`

### Plugin Components

#### Commands (`commands/*.md`)
User-invocable slash commands（如 `/dev-proxy`, `/search`）

**Structure:**
```markdown
---
name: command-name
description: What it does
---

Command implementation details and instructions to Claude...
```

#### Skills (`skills/<name>/SKILL.md`)
Specialized prompts/workflows，可 programmatically invoke。各 skill 為 folder，含 `SKILL.md` 與 optional supporting files（templates, scripts, references）。

**Use cases:**
- Complex multi-step workflows
- Reusable prompt templates
- Scheduled tasks

#### Agents (`agents/*.md`)
Autonomous agents for complex multi-step tasks

**Use cases:**
- Browser debugging workflows
- Code exploration tasks
- UI design iteration

#### Hooks (`hooks/hooks.json`)
Lifecycle hooks 於 specific events execute

**Available hooks:**
- `SessionStart` - When Claude Code session begins
- `PreToolUse` - Before any tool is invoked
- `PostToolUse` - After tool completes (can match specific tools)
- `ToolError` - When tool fails
- `Stop` - When session ends
- `Notification` - When notification is triggered

**Example from agnt plugin:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/notify-file-change.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Version Management Workflow

Release new plugin version 時：

1. **Update plugin manifest**: `plugins/<name>/.claude-plugin/plugin.json`
   ```json
   { "version": "0.8.0" }
   ```

2. **Update marketplace registry**: `.claude-plugin/marketplace.json`
   ```json
   {
     "plugins": [
       { "name": "agnt", "version": "0.8.0" }
     ]
   }
   ```

3. **Ensure MCP server is published** to npm with matching/compatible version
   - 此 project 用 `@latest` tag，故 any published version works
   - 可 pin specific version：`@standardbeagle/agnt@0.8.0`

4. **Tag the release** in Git
   ```bash
   git tag -a v0.8.0 -m "Release agnt v0.8.0"
   git push origin v0.8.0
   ```

### Testing and Validation

**Local Testing:**
```bash
# Add marketplace from local directory
claude mcp add-dir /path/to/standardbeagle-tools

# Or test individual plugin
claude mcp add agnt --source ./plugins/agnt
```

**Validation:**
```bash
# Validate marketplace structure
claude plugin validate .

# Validate specific plugin
claude plugin validate ./plugins/agnt
```

**Common validation issues:**
- Missing `.claude-plugin/marketplace.json` or `plugin.json`
- Invalid JSON syntax
- Duplicate plugin names
- Path traversal (`..` in source paths)
- Missing referenced files (commands, skills, agents)

### SKILL.md Description Compression Policy

Description fields 於 skill auto-invocable（`disable-model-invocation: false`）時每 turn 入 context。Char budget 為 context window 1% 或 8K fallback；長 descriptions 會 mechanical truncation。

skill matcher 為 **LLM-driven semantic**，非 keyword indexing。可劇壓，惟 concept tokens 與 Use-when triggers 必存。

**Two-pass compression**（依 `dev-standards:skill-description-style`）：
1. **Conceptual conciseness** — 去 citations, motivation prose, examples, cross-skill linkage clauses, hedging。留 core function, concept tokens, Use-when triggers, Skip clauses。
2. **Caveman/wenyan** — 去 articles/filler/hedging。wenyan glue 若更短且不晦則用。Bullet-list keyword clusters 勝 prose sentences。

**Targets**：150–400 chars typical。**Hard ceiling**：1024 chars（some clients reject longer）。

**Visibility tier**（此 repo）：5 plugins auto-invocable（agnt, dartai, lci, dev-standards, modern-html）；餘 plugins per skill 設 `disable-model-invocation: true` — descriptions 不耗 per-turn context，故壓縮優先低。**Recommender-gateway 慣例**：大型全手動 bundle 各設**唯一**自動 `recommender` 技藝（無 `disable-model-invocation`），據意圖導向其手動技藝之一，含 Disambiguation 節化解近義技藝。已推行於 14 plugins：slop-mcp（另有 `slop-find-tools`）、figma-query、ux-developer、prompt-engineer、workflow、photino、ux-design、mcp-architect、mcp-tester、design-utilities、dart-query、caveman、compound-review、slop-coder。gateway 描述須維持 concept tokens + Use-when triggers。新增大型手動 bundle 時比照設 gateway。

### Best Practices for This Marketplace

1. **Always use `${CLAUDE_PLUGIN_ROOT}`** for file references in hooks and configs
2. **Use npx with `@latest`** for MCP servers to avoid version mismatches
3. **Keep plugins self-contained** - no external file dependencies
4. **Test locally** before pushing with `claude plugin validate .`
5. **Follow semantic versioning** (major.minor.patch)
6. **Document commands clearly** with descriptions in frontmatter
7. **Use kebab-case** for all names (plugins, commands, agents)
8. **Sync versions** across plugin.json and marketplace.json
9. **Test with actual MCP servers** - ensure npx packages are published
10. **Use hooks sparingly** - they execute on every matching event