# Remote access — showing the companion over SSH

The companion server binds **loopback** (`127.0.0.1:<port>`). If the user is
driving this session over SSH, that URL is unreachable from their laptop. Before
telling them to "open http://localhost:…", establish a reachable path and
**record it** so future sessions cost one config read instead of a rediscovery
probe.

## 1. Detect a remote session

```sh
[ -n "$SSH_CONNECTION" ] && echo "remote (ssh)" || echo "local"
```

`SSH_CONNECTION` / `SSH_TTY` set ⇒ the user is remote; a loopback URL won't
work. (VS Code Remote-SSH also sets these but auto-forwards ports — see method 3.)

## 2. Read the recorded method first (low-cost path)

Before probing anything, check the persisted choice:

```sh
cat ~/.config/companion/remote-access.kdl 2>/dev/null
```

If it exists and its `method` still works, use it directly — run the stored
`command`, hand the user the stored `url` template with the current port, done.
No rediscovery. Only fall through to §3 if the file is missing or the method
fails (e.g. `tailscale status` now reports the mesh is down).

## 3. Discover a method — preference ladder

Try in order; stop at the first that works. Earlier = more private + more stable.

| # | Method | Probe | Command | Reach |
|---|---|---|---|---|
| 1 | **Tailscale** (mesh VPN) | `tailscale status` up? | share the node IP: `tailscale ip -4` → `http://<ip>:<port>` (or `tailscale serve <port>`) | private mesh |
| 2 | **SSH local forward** | always available | user adds a tunnel to their session (below) → `http://localhost:<port>` | private, point-to-point |
| 3 | **Editor auto-forward** | connected via VS Code / Cursor Remote-SSH? | none — the editor forwards the port; give `http://localhost:<port>` | private |
| 4 | **Cloudflare quick tunnel** | `command -v cloudflared` | `cloudflared tunnel --url http://localhost:<port>` → prints a `*.trycloudflare.com` URL | **public** |
| 5 | **ngrok** | `command -v ngrok` (+ authtoken) | `ngrok http <port>` → prints a `*.ngrok-free.app` URL | **public** |

### Method 2 — SSH local forward (best default when no VPN)

Zero extra tools, private, works everywhere. Two ways to give the user:

- **Reconnect with a forward** (simplest to instruct):
  ```sh
  ssh -L <port>:localhost:<port> <their-ssh-host>
  ```
  then open `http://localhost:<port>` on their laptop.
- **Add a forward to the live session without reconnecting** — in the terminal
  press Enter, then type the escape sequence `~C` to open the `ssh>` prompt, and:
  ```
  ssh> -L <port>:localhost:<port>
  ```
  (`~C` only works at the start of a line, in an interactive OpenSSH session.)

### Methods 4 & 5 — public tunnels (last resort)

`cloudflared`/`ngrok` expose the companion to the **public internet**. The
companion has **no authentication** — anyone with the URL reaches the session,
including `demo`/`annotate-artifact` iframes and any `file-edit` UI. Use only
when 1–3 are impossible, prefer Cloudflare quick tunnels (no account) over ngrok,
and **tear the tunnel down** (`Ctrl-C`) the moment the review is done. Never put
secrets in a screen while a public tunnel is open.

## 4. Record the method (KDL, house style)

Once a method works, write it so the next session skips §3. Path:
`~/.config/companion/remote-access.kdl`.

```kdl
// How to expose the loopback companion to this SSH user.
// Read before probing; the agent runs `command` and hands the user `url`.
remote-access {
    method "ssh-forward"          // tailscale | ssh-forward | editor-forward | cloudflared | ngrok
    // {port} is substituted with the live companion port at use time.
    command "ssh -L {port}:localhost:{port} dev-box"
    url     "http://localhost:{port}"
    reach   "private"             // private | public
    host    "dev-box"             // ssh host alias, for ssh-forward / reconnect hints
    verified-at "2026-07-04"      // ISO date the method last worked
}
```

Field notes:
- `method` picks the ladder rung so a future run knows what to re-verify.
- `command` is the exact thing to run (or tell the user to run); `{port}` is the
  only substitution.
- `url` is what the user opens once `command` is live.
- `reach` gates the secret-safety warning — `public` ⇒ re-warn before use.
- `verified-at` lets a future run decide whether to trust or re-probe.

Update `verified-at` (and any changed `command`) whenever the method is
re-confirmed or repaired. If the recorded `method` stops working, fall back to
§3, then overwrite the file with the new winner.

## Why record it

Rediscovery is the expensive part — probing `tailscale status`, checking
`command -v cloudflared`, reasoning about which is safe. Persisting the winner
turns every subsequent "show me the review" into a single `cat` + substitute +
run. Same rationale as the provenance and feedback-loop records: pay the
discovery cost once.
