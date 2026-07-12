#!/usr/bin/env node
/**
 * bump-plugins — bump the version of every plugin whose files changed.
 *
 * Why this is not optional: Claude caches a plugin by VERSION. If a plugin's
 * content changes but its version does not, `claude plugin update` reports
 * "already at the latest version" and every machine keeps serving the stale
 * cached copy. Content changes without a bump are invisible to users.
 *
 * Cross-platform: Node only, zero deps, `git` for change detection.
 *
 * Usage:
 *   node scripts/bump-plugins.mjs --since <ref>     # bump plugins changed since ref
 *   node scripts/bump-plugins.mjs --since <ref> --dry-run
 *   node scripts/bump-plugins.mjs --plugin <name>   # bump one explicitly
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const at = (f) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const since = at("--since");
const only = at("--plugin");
const repo = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

/** Plugin dirs from marketplace.json — `source` is authoritative, not `plugins/<n>`. */
function pluginSources() {
  const mp = join(repo, ".claude-plugin", "marketplace.json");
  const d = JSON.parse(readFileSync(mp, "utf8"));
  const out = new Map();
  for (const p of d.plugins ?? []) {
    const n = typeof p === "string" ? p : p.name;
    const s = (typeof p === "string" ? undefined : p.source) ?? `./plugins/${n}`;
    if (n) out.set(n, s.replace(/^\.\//, ""));
  }
  return out;
}

function changedDirs(ref) {
  const out = execFileSync("git", ["-C", repo, "diff", "--name-only", `${ref}..HEAD`], {
    encoding: "utf8",
  });
  const staged = execFileSync("git", ["-C", repo, "diff", "--name-only", "HEAD"], {
    encoding: "utf8",
  });
  return new Set([...out.split(/\r?\n/), ...staged.split(/\r?\n/)].map((s) => s.trim()).filter(Boolean));
}

const sources = pluginSources();
const changed = since ? changedDirs(since) : new Set();

let bumped = 0;
for (const [name, dir] of [...sources].sort()) {
  if (only && name !== only) continue;
  if (!only) {
    // did any file under this plugin change?
    const touched = [...changed].some((f) => f.startsWith(dir + "/"));
    if (!touched) continue;
  }
  const mp = join(repo, dir, ".claude-plugin", "plugin.json");
  if (!existsSync(mp)) continue;
  const raw = readFileSync(mp, "utf8");
  const d = JSON.parse(raw);
  const v = String(d.version ?? "0.0.0");
  const m = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(v);
  if (!m) {
    console.log(`  SKIP ${name}: version '${v}' is not semver`);
    continue;
  }
  // Content changed, contract did not -> patch bump. Callers wanting minor/major
  // should edit plugin.json directly; this tool exists to stop SILENT staleness.
  const next = `${m[1]}.${m[2]}.${Number(m[3]) + 1}${m[4]}`;
  console.log(`  ${name}: ${v} -> ${next}`);
  if (!DRY) {
    writeFileSync(mp, raw.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${next}"`));
  }
  bumped++;
}

console.log(`\n${bumped} plugin(s) ${DRY ? "would be" : ""} bumped`);
if (!bumped) console.log("(no plugin content changed — nothing to bump)");
