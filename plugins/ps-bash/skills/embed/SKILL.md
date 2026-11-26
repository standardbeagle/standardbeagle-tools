---
name: ps-bash-embed
description: "Host ps-bash in your own .NET app: PsBash.Core NuGet, BashTranspiler.Transpile, importing the embedded version-matched module, keeping objects for object cmdlets, IHostTerminal. ps-bash 嵌入 .NET 應用。 Use when: a GUI, daemon or agent tool runs bash in-process, transpiling bash to PowerShell, vim/less hang or say TERM not set in an embedding."
disable-model-invocation: true
---

# Embedding ps-bash in a .NET process

BeagleTerm's session server is the reference embedding (`src/BeagleTerm.Core/PowerShell/PowerShellHost.cs`).

## 1. Reference and transpile

`PsBash.Core` on nuget.org (net8.0 and net10.0) carries the transpiler, the parser and the module
(psm1 + `PsBash.Cmdlets.dll`) as embedded resources. Pin one version: the module, the cmdlets and the
transpiler must come from the same build.

```csharp
using PsBash.Core.Transpiler;    // BashTranspiler
using PsBash.Core.Parser;        // ParseException; the public AST is PsBash.Core.Parser.Ast
string ps;
try { ps = BashTranspiler.Transpile("ls -la | grep .cs | sort -k5 -h"); }
catch (ParseException) { /* not bash: run the text as PowerShell, as BeagleTerm does */ }
```

A result without `Invoke-Bash` in it was plain PowerShell passed through. Also: `TranspileWithMap`
(source map), `RunnablePrefix` (run the lines before a syntax error, as bash does).

## 2. Import the embedded module into your runspace

```csharp
string psd1 = PsBash.Core.Runtime.ModuleExtractor.ExtractEmbedded();   // version-stamped per-user dir, lock-safe across processes
string cmdlets = Path.Combine(Path.GetDirectoryName(psd1)!, "PsBash.Cmdlets.dll");
using var ps = PowerShell.Create(); ps.Runspace = runspace;
ps.AddCommand("Import-Module").AddParameter("Name", cmdlets).AddParameter("Global").Invoke(); ps.Commands.Clear();
ps.AddCommand("Import-Module").AddParameter("Name", psd1).Invoke();
```

Import `PsBash.Cmdlets.dll` by path FIRST. The psm1 probes with `Get-Command Invoke-BashBasename`,
which autoloads from `PSModulePath`: a user-installed PsBash answers, and its cmdlets then fail against
your transpiler (`Could not load type 'PsBash.Core.RawBytes'`). If extraction fails, fall back to an
installed `PsBash` module and report it rather than dying.

## 3. Keep objects for object cmdlets

To the transpiler anything it does not implement is a native program reading text, so
`ls | Select-Object -First 3` becomes `Invoke-BashLs | ForEach-Object { Get-BashText $_ } | Select-Object …`
and shows strings. For a rich UI strip that flattening before `*-Object`, `Format-*`, `ConvertTo-*`,
`Export-*`, `Get-Member` and `Out-GridView` (BeagleTerm: `KeepObjectsForObjectCmdlets`); keep it before
text cmdlets (`Select-String`, `Out-File`, `Set-Content`). Render rows from the `PsBash.*` objects
(`ps-bash-objects`) and text from `BashText`.

## 4. Give programs a terminal

In-process every program gets pipes, so `vim`, `less`, `htop`, `git commit`'s editor and `clear` fail
("TERM environment variable not set") or hang. A host that owns a PTY lends it:

```csharp
sealed class PtyTerminal : PsBash.Core.IHostTerminal {
    public int? Run(PsBash.Core.HostTerminalLaunch l, CancellationToken stop) {
        // Start l.Path with l.Arguments in l.WorkingDirectory on your PTY as its foreground job.
        // l.Environment is COMPLETE (a null value = unset it). Return the exit status (128+N for
        // signal N), or null to decline (ps-bash uses pipes). End the program when stop fires.
        // A thrown exception reports "NAME: message" with status 126.
    }
}
PsBash.Core.HostTerminal.Register(runspace, new PtyTerminal());
// once per runspace, after importing the module - registering alone installs nothing:
ps.AddScript("[PsBash.Cmdlets.HostTerminalLookup]::Install($ExecutionContext.InvokeCommand)").Invoke();
```

Only a program that writes straight to the host and reads no pipeline input goes to the terminal:
`vim x` and the `htop` in `clear && htop` do; `$(git log)`, the `ls` in `ls | less`, a redirected
program and one with stderr merged into stdout keep their pipes, as in bash. Spec:
`docs/specs/host-terminal.md`.

## Out of process instead

When typed objects are not needed, run `ps-bash -c '…'` (text out, exit code back) or a named session
(`ps-bash-sessions`). The launcher-to-host `HostProtocol` is internal; build only on the documented
client contract.
