# ps-bash plugin

Skills for building on [ps-bash](https://github.com/standardbeagle/ps-bash): bash commands that return
typed PowerShell objects. One auto-invoked gateway (`ps-bash-recommender`) routes to six manual skills.

| Skill | For |
|---|---|
| `ps-bash-objects` | Consuming `PsBash.*` objects and producing your own (`BashText`, `New-BashObject`) |
| `ps-bash-browse` | Object workbenches: adapters, actions, the destructive-preview gate |
| `ps-bash-hooks` | Prompt and on-cd hooks, `~/.psbashrc`, ls providers, completion |
| `ps-bash-styled-output` | `Format-Styled` / `Show-Styled` themes and `PSBASH_DEFAULT_FORMAT` |
| `ps-bash-embed` | Hosting the transpiler and module in a .NET app, `IHostTerminal` |
| `ps-bash-sessions` | Named sessions, the front-end client contract, compact agent output |

Needs ps-bash itself (`Install-Module PsBash`, or the shell from the repository's installers). Work on
ps-bash's own source uses the skills in that repository's `.claude/skills` instead.
