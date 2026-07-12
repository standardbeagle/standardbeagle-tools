#!/usr/bin/env node
/**
 * validate-marketplace — check a Claude plugin marketplace repo before commit.
 *
 * Catches breakage that ships SILENTLY: Claude logs a load error and carries on,
 * so a plugin's hooks or skills can be dead for weeks while the plugin still
 * appears installed and healthy. Exits non-zero on any error, so it gates the
 * pre-commit hook and CI.
 *
 * Cross-platform by construction: Node only, zero dependencies, no shell-outs
 * except `git` (which is present wherever the hook can run). No bash, no
 * POSIX-only paths, no chmod semantics.
 *
 * Usage:
 *   node scripts/validate-marketplace.mjs            # whole repo
 *   node scripts/validate-marketplace.mjs --staged   # only staged plugins (hook)
 *   node scripts/validate-marketplace.mjs --fix      # auto-fix what is safe
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, basename, sep } from "node:path";
import { execFileSync } from "node:child_process";

const DESC_MAX = 600;
const SECRET =
  /(sk-[A-Za-z0-9]{20,}|figd_[A-Za-z0-9_-]{20,}|r8_[A-Za-z0-9]{20,}|dsa_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|eyJhbGciOi[A-Za-z0-9_.-]{40,})/;

const args = process.argv.slice(2);
const FIX = args.includes("--fix");
const STAGED = args.includes("--staged");
const repo = args.find((a) => !a.startsWith("--")) ?? process.cwd();

const errors = [];
const warnings = [];
const fixes = [];
/** Errors that --fix actually repaired. They must not block the commit. */
const repaired = new Set();
/** skill name -> where first seen; a duplicate name shadows another skill. */
const skillNames = new Map();
const err = (w, m) => errors.push([w, m]);
const warn = (w, m) => warnings.push([w, m]);

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

/** Parse YAML frontmatter well enough for name/description. No YAML dep. */
function frontmatter(file) {
  const text = readFileSync(file, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return { fm: null, text };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = /^([A-Za-z_-]+):\s*(.*)$/.exec(line);
    if (km) fm[km[1]] = km[2].trim().replace(/^["']|["']$/g, "");
  }
  return { fm, text };
}

/**
 * The `agnt` bug. Claude auto-loads <plugin>/hooks/hooks.json. Naming that same
 * path again in the manifest's `hooks` raises a fatal "Duplicate hooks file
 * detected" — which disables ALL of the plugin's hooks while the plugin still
 * reports as installed. Silent, total hook failure.
 */
function checkHooks(pdir, manifest, rel) {
  if (manifest.hooks === undefined) return;
  const list = Array.isArray(manifest.hooks) ? manifest.hooks : [manifest.hooks];
  const keep = [];
  let dropped = false;
  for (const h of list) {
    if (typeof h !== "string") {
      keep.push(h);
      continue;
    }
    const norm = h.replace(/^\.\//, "").split(/[\\/]/).join("/");
    if (norm === "hooks/hooks.json") {
      err(
        rel,
        "manifest `hooks` references hooks/hooks.json — that path is auto-loaded; " +
          "listing it is a fatal 'Duplicate hooks file' error that DISABLES all of " +
          "this plugin's hooks",
      );
      dropped = true;
      if (FIX) continue;
      keep.push(h);
    } else {
      if (!existsSync(join(pdir, ...norm.split("/")))) {
        err(rel, `manifest \`hooks\` references missing file: ${h}`);
      }
      keep.push(h);
    }
  }
  if (FIX && dropped) {
    const mp = join(pdir, ".claude-plugin", "plugin.json");
    const data = readJson(mp);
    if (keep.length) data.hooks = Array.isArray(manifest.hooks) ? keep : keep[0];
    else delete data.hooks;
    writeFileSync(mp, JSON.stringify(data, null, 2) + "\n");
    fixes.push([rel, "removed auto-loaded hooks/hooks.json from manifest `hooks`"]);
    repaired.add(rel);
  }
}

/**
 * `kind` decides which fields are required:
 *   skill            -- needs `name` + `description` (SKILL.md is name-addressed)
 *   command / agent  -- need `description` only; they are addressed by FILENAME
 *                       (agents/browser-debugger.md -> `agnt:browser-debugger`),
 *                       so a `name` field is not required and usually absent.
 */
function checkMd(file, rel, kind) {
  const { fm, text } = frontmatter(file);
  if (!fm) {
    err(rel, `${kind} has no YAML frontmatter`);
    return null;
  }
  if (kind === "skill" && !fm.name) err(rel, `${kind} frontmatter missing \`name\``);
  if (!fm.description) err(rel, `${kind} frontmatter missing \`description\``);
  else if (fm.description.length > DESC_MAX)
    warn(
      rel,
      `${kind} description is ${fm.description.length}ch (>${DESC_MAX}) — descriptions are ` +
        `injected into every agent's context and compete for a fixed skills budget`,
    );
  if (SECRET.test(text)) err(rel, `${kind} appears to contain a committed secret`);
  return fm;
}

/**
 * @param name   plugin name
 * @param source path from marketplace.json (e.g. "./plugins/agnt" or "./math-physics-ml").
 *               Plugins do NOT have to live under plugins/ — the marketplace entry's
 *               `source` is authoritative.
 */
function checkPlugin(name, source) {
  const relDir = (source ?? `./plugins/${name}`).replace(/^\.\//, "");
  const pdir = join(repo, ...relDir.split("/"));
  const rel = relDir;
  if (!isDir(pdir)) return err(rel, `plugin directory does not exist (source: ${source})`);

  const mp = join(pdir, ".claude-plugin", "plugin.json");
  if (!existsSync(mp)) {
    // A frequent mistake: the manifest is present but misnamed. Claude only reads
    // plugin.json, so the plugin silently fails to load.
    const wrong = ["manifest.json", "plugin.jsonc", "claude-plugin.json"].find((f) =>
      existsSync(join(pdir, ".claude-plugin", f)),
    );
    return err(
      rel,
      wrong
        ? `manifest is named .claude-plugin/${wrong} — Claude only reads plugin.json, so this plugin never loads`
        : "missing .claude-plugin/plugin.json",
    );
  }

  let manifest;
  try {
    manifest = readJson(mp);
  } catch (e) {
    return err(rel, `plugin.json does not parse: ${e.message}`);
  }

  // Claude resolves plugins by directory. A name mismatch makes
  // `claude plugin update <name>` fail with "Plugin not found".
  if (manifest.name !== name)
    err(rel, `plugin.json name '${manifest.name}' != directory '${name}' — \`claude plugin update ${name}\` will fail`);
  for (const f of ["version", "description"])
    if (!manifest[f]) err(rel, `plugin.json missing \`${f}\``);

  checkHooks(pdir, manifest, rel);

  const sdir = join(pdir, "skills");
  if (isDir(sdir)) {
    for (const skill of readdirSync(sdir).sort()) {
      if (!isDir(join(sdir, skill))) continue;
      const sp = join(sdir, skill, "SKILL.md");
      if (!existsSync(sp)) {
        err(`${rel}/skills/${skill}`, "skill directory has no SKILL.md");
        continue;
      }
      const fm = checkMd(sp, `${rel}/skills/${skill}/SKILL.md`, "skill");
      // Claude namespaces plugin skills by DIRECTORY (`plugin:skill`), so the
      // frontmatter `name` may legitimately differ from the directory, and often
      // must: worktrack-loop's commands reference `Skill(worktrack-mcp-discovery)`
      // by name, so those names are load-bearing. Do NOT enforce a naming
      // convention here — it produced 24 warnings on names that were all correct.
      //
      // What DOES break is a duplicate name: two skills with the same `name`
      // collide in the flat namespace that non-Claude agents dispatch from, and
      // one silently shadows the other.
      if (fm?.name) {
        const prev = skillNames.get(fm.name);
        if (prev) err(`${rel}/skills/${skill}`, `SKILL.md name '${fm.name}' is already used by ${prev}`);
        else skillNames.set(fm.name, `${rel}/skills/${skill}`);
      }
    }
  }

  for (const [kind, sub] of [
    ["command", "commands"],
    ["agent", "agents"],
  ]) {
    const d = join(pdir, sub);
    if (!isDir(d)) continue;
    for (const f of readdirSync(d).sort())
      if (f.endsWith(".md")) checkMd(join(d, f), `${rel}/${sub}/${f}`, kind);
  }
}

function checkMarketplace() {
  const pdir = join(repo, "plugins");
  const onDisk = isDir(pdir)
    ? readdirSync(pdir).filter((d) => isDir(join(pdir, d)))
    : [];
  const mp = join(repo, ".claude-plugin", "marketplace.json");
  if (!existsSync(mp)) {
    err(".claude-plugin/marketplace.json", "missing");
    return onDisk;
  }
  let data;
  try {
    data = readJson(mp);
  } catch (e) {
    err(".claude-plugin/marketplace.json", `does not parse: ${e.message}`);
    return onDisk;
  }
  // name -> source path (authoritative; a plugin need not live under plugins/)
  const listed = new Map();
  for (const p of data.plugins ?? []) {
    const n = typeof p === "string" ? p : p.name;
    if (n) listed.set(n, typeof p === "string" ? undefined : p.source);
  }
  for (const n of onDisk.sort())
    if (!listed.has(n))
      warn(".claude-plugin/marketplace.json", `plugins/${n} exists but is not listed — it is not installable`);
  return listed;
}

function stagedPlugins() {
  const out = execFileSync("git", ["-C", repo, "diff", "--cached", "--name-only"], {
    encoding: "utf8",
  });
  const names = new Set();
  for (const line of out.split(/\r?\n/)) {
    // git always reports forward slashes, on every platform
    const m = /^plugins\/([^/]+)\//.exec(line.trim());
    if (m) names.add(m[1]);
  }
  return names;
}

const listed = checkMarketplace();
let targets = [...listed.keys()];
if (STAGED) {
  const staged = stagedPlugins();
  targets = targets.filter((n) => staged.has(n));
  if (!targets.length) {
    console.log("validate-marketplace: no plugin changes staged — skipping");
    process.exit(0);
  }
}
for (const n of targets.sort()) checkPlugin(n, listed.get(n));

const blocking = errors.filter(([w]) => !repaired.has(w));

console.log(`\n=== ${basename(repo)} — ${targets.length} plugin(s) checked ===`);
for (const [w, m] of fixes) console.log(`  FIXED  ${w}: ${m}`);
for (const [w, m] of blocking) console.log(`  ERROR  ${w}: ${m}`);
for (const [w, m] of warnings) console.log(`  warn   ${w}: ${m}`);
if (!blocking.length && !warnings.length && !fixes.length) console.log("  clean");
console.log(`  ${blocking.length} error(s), ${warnings.length} warning(s), ${fixes.length} fixed`);

if (blocking.length) {
  console.log(`\n${blocking.length} error(s) — commit blocked. Fix, or run with --fix.`);
  process.exit(1);
}
