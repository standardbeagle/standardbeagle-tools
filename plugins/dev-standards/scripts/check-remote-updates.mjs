#!/usr/bin/env node
//
// check-remote-updates.mjs — dev-standards plugin
//
// Looks for remote updates on the current branch and the base branch, then
// nudges the agent to merge them at the next stopping point. Wired to three
// Claude Code hook events:
//
//   SessionStart  — always fetch, report drift as session context
//   PostToolUse   — throttled fetch (periodic), report only when behind
//   Stop          — throttled fetch, warn the user when behind (stopping point)
//
// Design goals:
//   * Cross-platform. Pure Node + `git` on PATH. No bash, jq, timeout, or date
//     dependency (the previous check-remote-updates.sh failed on Windows where
//     those aren't reliably present, surfacing as a "hook blocking error").
//   * Resilient. EVERY failure path is swallowed and the process ALWAYS exits 0.
//     A dev-standards nudge must never block a tool call or a stop. The only
//     channel to Claude/the user is well-formed JSON on stdout; anything else
//     (missing git, offline, not a repo, malformed payload) is a silent no-op.
//
// Opt out entirely with DEV_STANDARDS_REMOTE_CHECK=0.
// Tune the throttle with DEV_STANDARDS_REMOTE_CHECK_INTERVAL (seconds, default 300).

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FETCH_TIMEOUT_MS = 15000;
const GIT_TIMEOUT_MS = 5000;

// Never let anything escape: the whole hook body is guarded and we always
// exit 0 in the finally block.
main().catch(() => {}).finally(() => process.exit(0));

async function main() {
  const event = process.argv[2] || 'PostToolUse';

  // Global opt-out.
  if ((process.env.DEV_STANDARDS_REMOTE_CHECK ?? '1') === '0') return;

  const intervalSec = toPositiveInt(process.env.DEV_STANDARDS_REMOTE_CHECK_INTERVAL, 300);

  // The hook payload arrives on stdin as JSON; prefer its cwd, fall back to
  // process.cwd(). Bounded so a never-closing stdin can't hang the hook.
  const payload = await readStdinJson(500);
  const dir = (payload && typeof payload.cwd === 'string' && payload.cwd) || process.cwd();

  // Must be inside a git work tree, else stay silent.
  const root = git(['-C', dir, 'rev-parse', '--show-toplevel']);
  if (!root) return;

  const stamp = join(root, '.git', 'dev-standards-remote-check');
  const force = event === 'SessionStart';

  // Throttle: SessionStart always fetches; other events honor the interval.
  if (!force && existsSync(stamp)) {
    const last = toPositiveInt(safeRead(stamp), 0);
    const nowSec = Math.floor(Date.now() / 1000);
    if (last > 0 && nowSec - last < intervalSec) return;
  }

  // Record the attempt up front so a slow/failing fetch still throttles next call.
  safeWrite(stamp, String(Math.floor(Date.now() / 1000)));

  // Fetch quietly, bounded, offline-tolerant. Failure is fine.
  git(['-C', root, 'fetch', '--quiet', '--all', '--prune'], FETCH_TIMEOUT_MS);

  const drift = [];

  // --- Current branch drift vs its upstream ---
  const curBranch = git(['-C', root, 'rev-parse', '--abbrev-ref', 'HEAD']);
  if (curBranch && curBranch !== 'HEAD') {
    const upstream = git(['-C', root, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']);
    if (upstream) {
      const behind = toPositiveInt(git(['-C', root, 'rev-list', '--count', `HEAD..${upstream}`]), 0);
      if (behind > 0) {
        drift.push(`current branch \`${curBranch}\` is ${behind} commit(s) behind \`${upstream}\``);
      }
    }
  }

  // --- Base branch new commits not yet in your work ---
  // Detect the base from origin/HEAD, fall back to main then master.
  let baseRef = git(['-C', root, 'symbolic-ref', '--quiet', 'refs/remotes/origin/HEAD']);
  if (baseRef) baseRef = baseRef.replace(/^refs\/remotes\//, '');
  if (!baseRef) {
    for (const cand of ['origin/main', 'origin/master']) {
      if (git(['-C', root, 'rev-parse', '--verify', '--quiet', cand]) !== null) {
        baseRef = cand;
        break;
      }
    }
  }
  if (baseRef && baseRef !== `origin/${curBranch}`) {
    const baseNew = toPositiveInt(git(['-C', root, 'rev-list', '--count', `HEAD..${baseRef}`]), 0);
    if (baseNew > 0) {
      drift.push(`base \`${baseRef}\` has ${baseNew} new commit(s) not in your branch`);
    }
  }

  // Nothing to report → stay silent.
  if (drift.length === 0) return;

  const nudge =
    `Remote updates available: ${drift.join('; ')}. Always be merging: at your next ` +
    `natural stopping point (before starting new work, after a green commit), pull/merge ` +
    `remote changes to avoid drift and painful conflicts.`;

  if (event === 'Stop') {
    emit({ systemMessage: nudge });
  } else {
    // SessionStart, PostToolUse, and any unknown event fall back to context.
    const hookEventName = event === 'SessionStart' ? 'SessionStart' : 'PostToolUse';
    emit({ hookSpecificOutput: { hookEventName, additionalContext: nudge } });
  }
}

// --- helpers (all total; never throw) ---

/** Run git, returning trimmed stdout, or null on ANY failure (missing binary,
 *  non-zero exit, timeout). Never throws. */
function git(args, timeout = GIT_TIMEOUT_MS) {
  try {
    const out = execFileSync('git', args, {
      encoding: 'utf8',
      timeout,
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    });
    return out.trim();
  } catch {
    return null;
  }
}

/** Read stdin to end (bounded by timeoutMs) and JSON-parse it; null on anything unexpected. */
function readStdinJson(timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (raw) => {
      if (settled) return;
      settled = true;
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    };
    try {
      if (process.stdin.isTTY) return done('');
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (c) => { data += c; });
      process.stdin.on('end', () => done(data));
      process.stdin.on('error', () => done(data));
      const t = setTimeout(() => done(data), timeoutMs);
      if (typeof t.unref === 'function') t.unref();
    } catch {
      done('');
    }
  });
}

function emit(obj) {
  try {
    process.stdout.write(JSON.stringify(obj) + '\n');
  } catch {
    /* stdout closed — nothing we can do, stay silent */
  }
}

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function safeRead(path) {
  try {
    return readFileSync(path, 'utf8').trim();
  } catch {
    return '';
  }
}

function safeWrite(path, contents) {
  try {
    writeFileSync(path, contents);
  } catch {
    /* best effort */
  }
}
