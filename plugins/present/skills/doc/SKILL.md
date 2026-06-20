---
name: present-doc
description: "Open a markdown or HTML file in the browser (renders .md → HTML via CDN marked). Reusable doc presenter. Use when: show a markdown file, open a doc in browser, present handoff/notes/report doc to the user, view .md rendered"
disable-model-invocation: true
---

# Present: Doc

Open a given document in the browser. Markdown is rendered client-side (no local parser dependency); HTML is passed through.

## Process

1. Input: an absolute path to a `.md` or `.html` file.
2. If `.html`: open it directly (Step 4).
3. If `.md`: run `scripts/md-to-html.sh <md-path>` to produce a self-contained `<file>.view.html` (marked from CDN + minimal styling). If the source dir is read-only, pass an output path in the OS temp dir as the second arg.
4. Open: `xdg-open` (Linux) / `open` (macOS) / `start` (Windows). If agnt's proxy is running, serving through it is also fine.
5. Print the absolute path of what was opened.

## Fallback

If no browser-open command is available (headless CI, no display), print the absolute source path and a one-line note — do not fail the calling skill.
