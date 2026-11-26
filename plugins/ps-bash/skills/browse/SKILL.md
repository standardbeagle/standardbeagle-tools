---
name: ps-bash-browse
description: "Build object workbenches on ps-bash's browse: adapters keyed by type name, display columns, actions with a destructive-preview gate, scripted -List/-Select/-Action/-Exec. ps-bash browse 物件工作台。 Use when: an interactive picker or TUI over objects from a .psm1, adding actions for a PSTypeName, scripting browse non-interactively from an agent."
disable-model-invocation: true
---

# browse workbenches

`… | browse` keeps the original objects on its rows and offers actions on them. With a terminal on
stdin it opens a line-mode workbench (n/p move, s select, a action, q quit); redirected, it never
blocks and emits `BrowseRow` objects (index, selection, type, display text, `OriginalObject`).

```powershell
ps | browse -List                                     # rows, no UI (what agents and tests use)
ls | browse -Inspect 0
ls | browse -Select 0,2 -PassThru | Remove-Item -WhatIf   # the original objects out
ls | browse -Select 0 -Action delete                  # destructive: preview only
ls | browse -Select 0 -Action delete -Force           # runs it
ps | browse -Select 0 -Exec '$1 | Stop-Process'       # gated: classifier sees Stop-Process; needs -Force
```

Bindings in actions and `-Exec`: `$1`/`${1}`/`$_` the current object, `$items` the selection (or the
current one as a one-item array), `$__browse_current`/`$__browse_items` as stable names.

## An adapter from a module (no C#)

```powershell
$approve = New-BrowseAction -Name approve -Description 'Approve PR' -Script {
    param($Current, [object[]]$Items) foreach ($pr in $Items) { gh pr review $pr.Number --approve } }
$close = New-BrowseAction -Name close -Description 'Close PR' -Destructive -Script {
    param($Current, [object[]]$Items) foreach ($pr in $Items) { gh pr close $pr.Number } }
Register-BrowseAdapter -Name pr -TypeNames 'MyApp.PullRequest' `
    -DisplayProperties Number, Title, Author, State -Actions $approve, $close
```

- Emit objects with `PSTypeName = 'MyApp.PullRequest'`; the first adapter whose `TypeNames` match an
  object's `PSTypeNames` (or .NET type name) wins, and registered adapters beat the built-ins.
- Always call `Register-BrowseAdapter`: it writes PsBash's own module scope. A bare
  `$script:BrowseAdapters += …` from your module writes your scope and is never seen.
- `-Destructive` makes the action return a preview unless `-Force`. `-Exec` scripts are classified
  too: `Remove-Item`, `rm`, `del`, `Stop-Process`, `kill`, `Restart-Service`, `Set-Service` need `-Force`.
- Without an adapter, columns come from `DefaultDisplayPropertySet`, then public properties.
- Inspect what is registered: `Get-BrowseAdapter`; remove: `Unregister-BrowseAdapter`.

Worked example: `examples/04-interactive-tui/PrWorkbench.psm1` in the ps-bash repo; spec `docs/specs/browse.md`.
