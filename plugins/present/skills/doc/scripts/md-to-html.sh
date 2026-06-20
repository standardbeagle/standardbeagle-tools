#!/usr/bin/env bash
# Render a markdown file to a self-contained HTML viewer using marked (CDN).
# Usage: md-to-html.sh <path-to.md> [output.html]   (prints the output path)
set -euo pipefail
src="${1:?usage: md-to-html.sh <file.md> [out.html]}"
out="${2:-${src%.md}.view.html}"
title="$(basename "$src")"
{
  cat <<'HTML_HEAD'
<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>body{max-width:50rem;margin:2rem auto;padding:0 1rem;font:16px/1.6 system-ui,sans-serif;color:#1a1a1a}pre{background:#f4f4f4;padding:1rem;overflow:auto;border-radius:6px}code{font-family:ui-monospace,monospace}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.4rem .6rem}</style>
</head><body><div id="content"></div>
<script id="src" type="text/markdown">
HTML_HEAD
  cat "$src"
  cat <<'HTML_TAIL'
</script>
<script>document.getElementById('content').innerHTML=marked.parse(document.getElementById('src').textContent);</script>
</body></html>
HTML_TAIL
} > "$out"
sed -i.bak "s/__TITLE__/$title/" "$out" 2>/dev/null || sed -i '' "s/__TITLE__/$title/" "$out"
rm -f "$out.bak"
echo "$out"
