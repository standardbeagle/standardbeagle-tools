# DESIGN.md Schema Reference

Source: https://github.com/google-labs-code/design.md

A DESIGN.md file has two layers:

1. **YAML front matter** — machine-readable design tokens, between `---` delimiters at top of file.
2. **Markdown body** — human-readable design context, organized with `##` headings.

## YAML front matter schema

```yaml
version: <string>          # spec/schema version, e.g. "1.0"
name: <string>             # design system name
description: <string>      # one-line summary
colors:
  <token-name>: <Color>    # Color = hex string "#RRGGBB" (or rgba)
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>   # e.g. sm/md/lg -> "4px"
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <token-name>: <string | token reference>
```

### Types

- **Color** — hex string `"#1A1C1E"`, or `rgb()`/`rgba()`. Prefer hex.
- **Typography** — object:
  ```yaml
  fontFamily: <string>
  fontSize: <Dimension>      # "3rem", "16px"
  fontWeight: <number|string>
  lineHeight: <Dimension|number>
  letterSpacing: <Dimension>   # optional
  ```
- **Dimension** — CSS length string: `"16px"`, `"1rem"`, `"0.5em"`.
- **Token reference** — a component value may reference a top-level token by name, e.g. a button's `background: primary` points at `colors.primary`.

### Example (Heritage system)

```yaml
version: "1.0"
name: Heritage
description: A refined, editorial design system.
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  surface: "#FFFFFF"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: Public Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button:
    background: primary
    color: surface
    rounded: md
    padding: sm
```

## Markdown body sections (in order)

1. **## Overview** — brand philosophy and style direction.
2. **## Colors** — palette descriptions, when to use each token.
3. **## Typography** — font choices, scale, text styling intent.
4. **## Layout** — spacing system and layout guidelines.
5. **## Elevation & Depth** — shadows, visual hierarchy.
6. **## Shapes** — border radius, form language.
7. **## Components** — per-element specifications.
8. **## Do's and Don'ts** — usage guidelines and anti-patterns.

Each section explains *intent and application*, not just restating token values.
