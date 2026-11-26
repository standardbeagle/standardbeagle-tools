---
name: ps-bash-sessions
description: "Drive ps-bash from agents and front ends: named sessions keeping state between ps-bash -c calls, the terminal-broker client contract, compact agent output. ps-bash 命名會話與代理。 Use when: shell state must survive between commands, one shell per agent, attaching a front end to a running shell, cutting log tokens, setting ps-bash as Claude Code's or OpenCode's shell."
disable-model-invocation: true
---

# Named sessions and agent use

## Sessions: state between calls

```bash
ps-bash session start build --idle-secs 3600       # create or reuse; ends after 1 h of silence (default 24 h)
PSBASH_SESSION=build ps-bash -c 'x=5; cd /src'
PSBASH_SESSION=build ps-bash -c 'echo $x; pwd'      # 5, /src: one pinned runspace for the session's life
ps-bash session list                                # name, state, mode, pid, start time
ps-bash session status build
ps-bash session stop build
```

- A named session outlives the launcher that started it; only `stop` or its idle window ends it.
- One session per agent or workload: commands inside a session run one at a time (cwd and `$env:` are
  process-wide), while separate sessions never wait on each other.
- The launcher forwards only `PSBASH_*` variables to a stateful session and does not reimpose its own
  cwd or environment. Only exported variables reach a nested `sh -c`.
- A faulting command drops the pinned runspace; the next call gets a clean one, and the state is gone.
- `session start NAME --stateless` gives a fresh pooled runspace per command; changing mode needs a `stop`.
- Names: 1-32 of `A-Z a-z 0-9 _ -`. Sessions are per OS user, in a 0700 runtime directory.
- `kill -TERM $$` from inside reaches the session's running script as a message: a `trap` runs at its
  next top-level statement; with no trap the script ends 128+N and the host stays up.

## Attaching a front end

A client resolves the endpoint from `PSBASH_SESSION=NAME` (the launcher's rule), checks liveness in the
`<endpoint>.host.json` sidecar, and for the live terminal connects to `<endpoint minus .sock>-t.sock`:
one AF_UNIX stream of frames `[type:1][length:4 big-endian][payload ≤ 1 MiB]`.

| Direction | Frames |
|---|---|
| client → broker | `H` hello, first (flags byte; bit 0 = read-only), `I` input bytes, `R` resize (cols:2, rows:2), `Q` end the shell |
| broker → client | `O` output bytes (the first frames after hello replay the scrollback), `X` shell exited (exit code:4) |

Detach by closing the socket. Reference code: `src/PsBash.Shell/Sessions/` (`TerminalProtocol.cs`,
`TerminalBroker.cs`); contract: `docs/sessions.md`.

## Agent logs: compact output

`ps-bash --compact-output -c 'make check'` (or `PSBASH_COMPACT_OUTPUT=1`; `--no-compact-output` wins
for one call) keeps the command, exit code, timeout, stream labels, file:line diagnostics and the tail,
and collapses repeats and progress noise. Leave it off when exact bytes matter.

## ps-bash as an agent's bash (Windows)

Claude Code runs `CLAUDE_CODE_GIT_BASH_PATH` only when the file is named `bash.exe` or `sh.exe`: copy
`ps-bash.exe` to `bash.exe` in the same folder (`install-local.ps1` does), set that path and
`PSBASH_UNIX_PATHS=1` in the settings `env`, and restart. `echo $BASH_VERSION` printing
`0.x.0(1)-release` proves it took. OpenCode reads `SHELL`. Full guide: `docs/agent-setup.md` in the
ps-bash repository.
