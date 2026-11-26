---
name: ps-bash-objects
description: "Consume and produce ps-bash's typed pipeline objects: LsEntry, PsEntry, GrepMatch, WcResult and friends, the BashText contract, New-BashObject. ps-bash 型別物件管道。 Use when: reading properties from ls/ps/grep/find output in PowerShell, making your own objects flow through grep/sort/head and print as bash text, a pipeline prints strings instead of objects."
disable-model-invocation: true
---

# ps-bash typed objects

Every mapped bash command is an `Invoke-Bash*` cmdlet that emits a PSObject with a `PsBash.*`
type name and a `BashText` note property holding the exact bash line. Text consumers (`grep`, `sort`,
`head`, `uniq`, `>` and the screen) read `BashText`; the object itself travels on, so the result of
`ls -la | grep .ps1 | sort -k5 -h` is still `LsEntry` rows.

```powershell
Import-Module PsBash                       # PowerShell 7.4+
$top = ps aux | sort -k3 -rn | head -5      # PsEntry: PID, PPID, User, CPU, MemoryMB, RSS, Command, CommandLine, ProcessName
$top | Where-Object CPU -gt 5 | ForEach-Object { Stop-Process $_.PID -WhatIf }
(ls -la src | grep -v '/$').SizeBytes | Measure-Object -Sum    # LsEntry: Name, FullPath, IsDirectory, SizeBytes, Permissions, Owner, LastModified
```

Types: `LsEntry FindEntry StatEntry DuEntry TreeEntry CatLine GrepMatch RgMatch WcResult PsEntry
EnvEntry DateOutput SeqOutput ExprOutput TimeOutput WhichOutput TypeOutput AliasOutput ReadlinkOutput
MktempOutput TarListOutput GzipListOutput TrapOutput PingReply TraceHop BrowseRow MediaArtifact
TextOutput`, plus `TranspileFailed`/`RuntimeFailed` errors. Plain-text lines (`PsBash.TextOutput`)
come through as bare strings, not objects. Inspect with `$x.PSObject.TypeNames` and `$x | Get-Member`.

## Producing objects that behave

Give your object a `PsBash.`-style type name and a `BashText`; ps-bash's text commands then treat it
like their own:

```powershell
function Get-Deploys {
    foreach ($d in (Invoke-RestMethod $url)) {
        [PSCustomObject]@{
            PSTypeName = 'MyApp.Deploy'; Name = $d.name; Status = $d.status; Started = [datetime]$d.started
            BashText   = '{0,-20} {1,-8} {2:u}' -f $d.name, $d.status, [datetime]$d.started
        }
    }
}
Get-Deploys | grep failed | sort -k3      # objects survive; prints the BashText lines
```

- `New-BashObject -BashText $line -TypeName 'MyApp.Thing'` (module function; C#:
  `[PsBash.Cmdlets.BashRuntime]::NewBashObject(text, typeName)`) builds one with ps-bash's newline
  rules; with the default `PsBash.TextOutput` type it returns a plain string.
- `Get-BashText $obj` is the text any consumer sees: `BashText` if present, else the object's string form.
- An object with no `BashText` (`Get-ChildItem`, `Invoke-SqlCmd`) is stringified by `ToString()` for
  `grep`, and flattened to a table when the out-of-process host prints it.

## Traps

- In transpiled bash, a pipe into anything ps-bash does not implement counts as a native program, so
  `ls | Select-Object -First 3` transpiles to `… | ForEach-Object { Get-BashText $_ } | Select-Object`,
  which gives strings. Object cmdlets want the objects: call them from PowerShell, or strip that
  flattening the way BeagleTerm's `KeepObjectsForObjectCmdlets` does (see `ps-bash-embed`).
- `ps-bash -c` crosses a process boundary and returns text. Objects exist only where the module runs
  in your own PowerShell (module mode or an embedding).
- Since v0.15.0 bash code no longer resolves PowerShell aliases (`gci`, `iex` are 127); use full cmdlet names.
