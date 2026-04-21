---
name: parser-contract
description: Parser tolerance contract — what the @risk line parser must do when handed malformed input. Never throw, never panic.
---

# Parser Tolerance Contract / 解析器容忍契約

## 硬規 (Hard rule)

**Parser MUST never throw, panic, or hang on any input.** All malformed cases degrade gracefully to one of three states:

- **skip** — not an `@risk` line (e.g. regular comment). No output, no warning.
- **warn** — recognized as `@risk` but unparseable. Emit warning to telemetry, treat unit as `{unknowns: high, conf: 0.0, tagged: null}`.
- **partial** — some fields parsed, others defaulted. Parsed fields win; defaulted fields logged in `notes`.

## 按類處置 (Per-category behavior)

下表對 `fuzz-corpus/malformed.txt` 各類輸入之期望行為：

| Category | Sample | Expected behavior |
|---|---|---|
| Missing axes | `@risk b+` | warn → `{unknowns: high, conf: 0.0}` |
| Missing partial axes | `@risk b+d.s.` | warn → unknowns:high (need all 5) |
| Empty line | `@risk` | warn → unknowns:high |
| Extra axes | `@risk b+d.s.r.u.x+` | parse first 5, ignore extra; log `extra_axes_dropped` |
| Extra token | `@risk b+d.s.r.u.extra` | parse 5 axes, ignore trailing; no warn |
| Numeric levels | `@risk b9d0s.r.u.` | warn → unparseable levels, unknowns:high |
| Packed digits | `@risk b2d0s3r1u0` | attempt to parse as numeric alt-form; if parser supports it, emit; if not, warn |
| Colon separators | `@risk b:+d:.s:.r:.u:.` | warn → unexpected glyph |
| Wrong order | `@risk s!b+d.r-u.` | warn → axis order violation, parse into correct slots with `order_corrected:true` note |
| Reverse order | `@risk u.r.s.d.b.` | warn → axis order violation |
| Wrong glyphs | `@risk b?d*s@r#u$` | warn → unknown level glyphs |
| Level typos | `@risk b_d-s.r+u!` | treat `_` as invalid → partial (d/s/r/u parseable, b defaulted `0`) |
| Wildcard glyphs | `@risk b*d?s!r?u*` | warn → unknown glyphs |
| Malformed date | `tagged:2026-14-99` | partial → parse axes, `tagged:null`, warn `malformed_date` |
| Malformed date | `tagged:21-04-2026` | partial → `tagged:null`, warn |
| Invalid conf | `conf:1.5`, `conf:-0.1`, `conf:abc` | partial → `conf:0.0`, warn `conf_out_of_range` |
| Empty conf | `conf:` | partial → `conf:0.0`, warn |
| Unknown model | `model:gpt-4` | partial → `model:unknown`, warn `unknown_model` |
| Empty model | `model:` | partial → `model:unknown`, warn |
| Empty tagged | `tagged:` | partial → `tagged:null`, warn |
| Missing tagged field | `@risk ... model:haiku conf:0.9` | partial → `tagged:null`, warn |
| Missing model field | `@risk ... tagged:... conf:0.9` | partial → `model:unknown`, warn |
| Missing conf field | `@risk ... tagged:... model:haiku` | partial → `conf:0.0`, warn |
| Multiline split | `@risk b+\nd.s.r.u. tagged:...` | warn → multiline not allowed, unknowns:high |
| HTML injection | `@risk b+d.s.<script>u. ...` | strip HTML, attempt parse; if still unparseable warn |
| SQL injection | `@risk ...; DROP TABLE tags; --` | treat trailing as garbage, parse 5 axes, ignore after |
| Fullwidth unicode | `@risk ｂ＋ｄ．ｓ．ｒ．ｕ．` | normalize to ASCII via NFKC, then parse |
| Zero-width joiners | `@risk b+​d.s.r.u.` | strip ZWJ/ZWNJ, then parse |
| Emoji | `@risk 🚨b+d.s.r.u.🚨` | strip non-ASCII outside known axis chars, parse |
| Uppercase axes | `@risk B+D.S.R.U.` | case-insensitive lower then parse |
| Extra whitespace | `@risk b+d.s.r.u.  tagged:...` | whitespace-tolerant, parse |
| Tab separators | `@risk\tb+d.s.r.u.\ttagged:...` | treat tab as whitespace, parse |
| Inner whitespace | `@risk b+ d. s. r. u. ...` | warn → axes must be contiguous, unknowns:high |
| No whitespace | `@risk b+d.s.r.u.tagged:...model:haikuconf:0.9` | warn → unparseable field boundaries |
| Doubled glyphs | `@risk b++d.s.r.u.` | warn → invalid level sequence |
| Doubled dot | `@risk b+d..s.r.u.` | warn → axis order violation |
| Doubled crit | `@risk b+d.s!!r.u.` | warn → doubled glyph |
| Packed no-glyph | `@risk b4d3s2r1u0` | warn if parser does not support numeric alt-form |
| Empty why | `@risk-why ""` | allowed; treat as empty string (not warn unless main `!` axis present) |
| Orphan why | `@risk-why "..."` without main line | warn → `orphan_why_line` |
| Crit without why | `@risk b!... conf:0.9` (no `@risk-why`) | warn → `crit_axis_missing_why` (required by schema when `!` present) |
| Crit with empty why | `... @risk-why ` (incomplete) | warn → `crit_axis_empty_why` |
| Null tokens | `@risk null null null null null` | warn → unparseable |
| Extra fields | `@risk ... extra-field:value` | ignore unknown field, parse known ones, no warn |

## 測量 (Metrics to collect)

對每次 fuzz 運行，收集：

- `total_lines_processed` — corpus size
- `throw_count` — 必為 `0`（否則 HARD FAIL）
- `panic_count` — 必為 `0`（HARD FAIL）
- `warn_count` — 估期望值（~40/56）
- `skip_count`
- `partial_count`
- `parsed_ok_count` — should be 0 for this malformed corpus
- `avg_parse_time_ms` — 單行 <10ms 目標

## 失敗判據 (Failure criteria)

| Condition | Result |
|---|---|
| Any throw / panic / unhandled exception | HARD FAIL, block release |
| Parse time > 100ms on any single line | warn (investigate pathological regex) |
| `warn_count` drops unexpectedly between versions | regression — parser newly silent on a case it used to catch |
| `parsed_ok_count > 0` on this corpus | HARD FAIL — should not accept any of these as valid |

## 擴充 (Extending the corpus)

每發現生產中遇到之新畸形 `@risk` 行，append 至 `malformed.txt`，並於本契約加行說明期望處置。corpus append-only；既有行勿刪（退化測試積累需留）。
