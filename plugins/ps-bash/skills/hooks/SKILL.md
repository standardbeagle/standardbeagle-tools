---
name: ps-bash-hooks
description: "Extend the ps-bash shell: prompt and on-cd hooks (direnv/fnm style), ~/.psbashrc, custom ls providers for synthetic paths, complete -W word lists and flag completers. ps-bash 鉤子與擴展。 Use when: running code on every prompt or directory change, making ls list a virtual path (myfs:, an API), adding tab completion to a command, writing a .psbashrc."
disable-model-invocation: true
---

# Hooks, providers and completion

All of these work in module mode and in the interactive shell, from a `.psm1`, a profile or `~/.psbashrc`.

## Prompt and on-cd hooks

```powershell
Register-BashPromptHook -Name clock -ScriptBlock { $Host.UI.RawUI.WindowTitle = "ps-bash " + (Get-Date -f HH:mm) }
Register-BashChpwdHook  -Name fnm   -ScriptBlock { param($OldPath, $NewPath) fnm use --silent-if-unchanged }
Get-BashHook                              # what is registered
Unregister-BashChpwdHook -Name fnm        # and Unregister-BashPromptHook
```

- ps-bash wraps PowerShell's `prompt` rather than replacing it: an existing prompt (oh-my-posh,
  Starship) is kept in `$global:__BashOriginalPrompt` and still runs.
- chpwd hooks fire between prompts when `$PWD` changed, in the global scope (`$env:`/`$global:`
  changes persist), in name order. A throwing hook is caught and appended to `$global:BashHookErrors`;
  it never ends the shell. Re-registering a name replaces it.
- Bash's `PROMPT_COMMAND=…` in `.psbashrc` becomes a prompt hook.

## ~/.psbashrc

Sourced when the interactive shell starts (`PSBASH_HOME` moves home; `--rcfile FILE` replaces it,
`--norc` skips it). `alias`, `unalias` and `complete` lines go to the shell's tables; everything else
is transpiled and run. Interactive `source FILE` takes the same path. Example:
`examples/02-interactive-shell/psbashrc.example`.

## ls providers: make `ls` list anything

```powershell
Register-BashLsProvider -Name s3 -Detect { param($path) $path.StartsWith('s3:') } -List {
    param($path, $flags)
    foreach ($o in (Get-MyS3Objects $path)) {
        [PSCustomObject]@{ PSTypeName = 'PsBash.LsEntry'; Name = $o.Key; FullPath = "s3:$($o.Key)"
            IsDirectory = $false; IsSymlink = $false; SizeBytes = $o.Size; Permissions = '-rw-r--r--'
            LinkCount = 1; Owner = ''; Group = ''; LastModified = $o.Modified; BashText = '' }
    }
}
ls -la s3:bucket/logs
```

Providers are asked first, for any target that is not a real file or directory; PowerShell
providers (`Registry:`, `Cert:`, PSDrives) are the fallback. Emit `PsBash.LsEntry` objects so
`ls`'s formatting, sorting and `browse` apply.

## Completion

- Interactive shell: `complete -W 'start stop status' svc` (static word lists). `complete -F func`
  registers but never runs the function, by design.
- PowerShell side: `Register-BashCompletions` registers flag completers for every mapped command from
  its flag specs; your own commands use PowerShell's `Register-ArgumentCompleter`.
- A DLL plugin system and a config file are designed (`docs/specs/plugin-architecture.md`,
  `config-format.md`) but not built: do not look for `PluginLoader` or `ICompletionProvider`.
