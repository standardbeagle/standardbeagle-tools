---
name: ps-bash-recommender
description: "Routes ps-bash intent to the one right manual skill — the plugin's only auto-invoked gateway. ps-bash 唯一自動網關。 Use when: writing a script, module, app or agent tool on ps-bash or PsBash; typed objects from bash commands (LsEntry, PsEntry, BashText); browse workbench; prompt/cd hooks; Format-Styled; embedding PsBash.Core; PSBASH_SESSION or named sessions."
---

# ps-bash skill recommender

ps-bash transpiles bash to PowerShell; every mapped command (about 100 `Invoke-Bash*` cmdlets) emits
typed `PsBash.*` objects whose `BashText` is the exact bash output. Apps integrate through those
objects, PowerShell extension functions in the `PsBash` module, the `PsBash.Core` NuGet package, and
named sessions. There is no MCP, JSON-RPC or `--json` surface: typed data needs PowerShell.

The skills below set `disable-model-invocation: true`, so the Skill tool refuses them. Read the file
instead: `${CLAUDE_PLUGIN_ROOT}/skills/<dir>/SKILL.md` (if that variable is unset or points at another
plugin, glob `~/.claude/plugins/cache/*/ps-bash/*/skills/<dir>/SKILL.md` and take the highest
version). A user can still type `/ps-bash:<name>`.

| Intent | Skill (dir) |
|---|---|
| Read properties off `ls`/`ps`/`grep`/`wc` output; make your own objects flow through `grep`, `sort`, `head` and print right | `ps-bash-objects` (objects) |
| An interactive object workbench: rows, selection, actions with a destructive-preview gate (`… \| browse`) | `ps-bash-browse` (browse) |
| Run code on every prompt or `cd` (direnv/fnm style); make `ls` list a synthetic path; tab completion | `ps-bash-hooks` (hooks) |
| Colour, buttons and expandable rows for objects with CSS (`Format-Styled`, `Show-Styled`, `PSBASH_DEFAULT_FORMAT`) | `ps-bash-styled-output` (styled-output) |
| Host ps-bash in your own .NET process: transpile bash, import the embedded module, give programs a terminal | `ps-bash-embed` (embed) |
| State that lasts between `ps-bash -c` calls, an agent's own shell, attaching a front end, compact agent logs | `ps-bash-sessions` (sessions) |

Not here: changing ps-bash itself (new commands, grammar, Pester) uses the skills in the ps-bash
repository's `.claude/skills`. Showing objects as widgets inside BeagleTerm is `beagleterm:beagleterm-widgets`.
