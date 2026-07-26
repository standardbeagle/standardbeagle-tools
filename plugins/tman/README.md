# tman

Supervised process runs for AI coding agents. `tman` wraps every command it launches with
hard limits and a reaper: wall-time and stall kills, opt-in memory/CPU culling of the whole
process tree, dedup locks, parallelism caps, and automatic cleanup of the orphans an agent
leaves behind when it hangs, gets distracted, or the machine suspends.

## This plugin does not install the tman binary

Installing this plugin gives you the marketplace listing and this documentation. It does
**not** put `tman` on your PATH — `tman` is a single native binary distributed through its
own releases, and Claude plugins do not install binaries.

Install it yourself, once per machine:

```sh
# shell one-liner (linux/macOS)
curl -fsSL https://raw.githubusercontent.com/standardbeagle/tman/main/install.sh | sh

# PowerShell (Windows)
irm https://raw.githubusercontent.com/standardbeagle/tman/main/install.ps1 | iex

# npm
npm install -g @standardbeagle/tman
```

Prebuilt binaries for linux-x64, linux-arm64, win-x64, osx-x64, and osx-arm64 are attached to
every [GitHub release](https://github.com/standardbeagle/tman/releases).

Confirm it landed:

```sh
tman --version
```

If that fails, nothing else here will work — the plugin has no fallback and does not shim the
command.

This plugin carries its own version, which tracks the packaging here and not the binary's.
`tman --version` is the only thing that tells you which `tman` you are running.

## No MCP server

`tman` is a CLI. It speaks exit codes and stdio to the shell, not the Model Context Protocol,
so this plugin ships no `.mcp.json`. You invoke it the way you invoke any other command.

## Usage

```sh
tman run -- npm test              # supervised, with the project's defaults
tman run --max-time 10m -- ./build
tman list                         # what is running right now
tman kill <id|all>
tman clean                        # reap orphans no run is holding
```

Per-project caps and aliases live in a `.tman.kdl` at the repo root, so `./test` can be
supervised transparently. Exit codes 124/125/126 mean the run was killed for timeout, stall,
or resource use — they are a result to report, not a reason to retry with looser caps.

Full documentation: <https://github.com/standardbeagle/tman>
