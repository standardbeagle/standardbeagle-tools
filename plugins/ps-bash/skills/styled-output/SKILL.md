---
name: ps-bash-styled-output
description: "Style ps-bash object output with CSS through Strata: Format-Styled (static ANSI), Show-Styled (interactive viewer with buttons and expandable rows), theme files, PSBASH_DEFAULT_FORMAT. ps-bash CSS 樣式輸出。 Use when: coloring or theming objects by kind/class, a custom .css/.pcss theme, making styled output the default, Format-Styled is not found."
disable-model-invocation: true
---

# Styled output

**Check first:** `Get-Command Format-Styled`. `Format-Styled`/`Show-Styled` exist only in builds made
with the Strata packages (`UseStrata`, from the sibling `strata` repo's local feed). Release and CI
builds are made without them; then fall back to `Format-Table` or ANSI in `BashText`.

```powershell
Get-Process | Format-Styled 'Process { color: cyan }' -Property Name, Id      # inline CSS
ls | Format-Styled ls                                                         # a built-in sheet by name
Get-Process | Select-Object *, @{ n = 'class'; e = { if ($_.CPU -gt 50) { 'busy' } } } |
    Format-Styled ./procs.css -Property Name, Id, CPU                         # class from a property
Get-Process | Show-Styled procsvc      # interactive: ↑↓/jk move, Enter expands, q quits
```

`-Css` (aliases `-Style`, `-Stylesheet`; position 0, optional) takes inline CSS (anything with `{`
or a newline), a file path, or a sheet name. Omitted, the `default` sheet applies.

## Selectors and properties

- `Kind`: the object's type name without namespace (`FileInfo`, `Process`, `LsEntry`).
- `.class`: words from the object's `class` property. `#id`: its `Id`, else `Name`.
- `:focused`, `:expanded` (interactive viewer); `Button` chrome; `command:` key bindings.
- Properties: `color` (16 ANSI names or `#rrggbb`), `background`, `font-weight`, `font-style`,
  `text-decoration`, `text-align`, `overflow`, grid/flex layout.

Built-in sheets: `default ls fs ps procsvc git net table list object error av`. A file with a
built-in's name in `$PSBASH_STYLE_PATH`, `~/.config/ps-bash/styles/` or `~/.psbash/styles/` appends
to it (later rules win). Example theme: `examples/03-styled-output/custom-theme.css`.

## Static vs interactive, and making it the default

`Format-Styled` renders one ANSI string and works everywhere (`-c`, pipes, files). `Show-Styled`
needs the host to own a terminal (the interactive REPL); redirected, it prints a one-line summary.

`PSBASH_DEFAULT_FORMAT=styled` renders all PowerShell object output with `Format-Styled`;
`interactive` uses `Show-Styled` when a terminal is present, else the static form. It affects only
objects that would go to `Out-String`: ps-bash's own `BashText` output streams unchanged, and any
failure falls back to stock formatting.
