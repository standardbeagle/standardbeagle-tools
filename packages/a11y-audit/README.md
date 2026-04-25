# @standardbeagle/a11y-audit

WCAG 2.2 accessibility audits over HTML strings (axe-core) and PDF files (pdf-lib). MCP server + library.

## Install

```bash
npm install @standardbeagle/a11y-audit

# or use via MCP:
npx -y @standardbeagle/a11y-audit@latest mcp
```

Audits run in-process via `jsdom` + `axe-core`; no browser is required.

## Tools

The seven `audit_*` tools share one input shape (`{ html, rules?, tags? }`) and one output shape (an axe `RunResult`). They differ only in which axe rule families they enable.

Common input:

```ts
{
  html: string,                  // raw HTML (full doc or fragment)
  rules?: string[],              // specific axe rule IDs to enable
  tags?: Array<'wcag2a' | 'wcag2aa' | 'wcag2aaa'
              | 'wcag21a' | 'wcag21aa' | 'best-practice'>,
}
```

Common output (axe-core `RunResult` excerpt):

```ts
{
  violations: Array<{ id: string, impact: string, nodes: Array<{ html: string, target: string[] }>, ... }>,
  passes: Array<{ id: string }>,
  incomplete: Array<{ id: string }>,
  inapplicable: Array<{ id: string }>,
}
```

### audit_html

Full axe-core run over the HTML. Default tag is `wcag21aa`.

```ts
await callTool('audit_html', { html: '<html>...</html>' });
```

### audit_css

Restricts the run to color contrast and sensory-cue rules.

```ts
await callTool('audit_css', { html });
```

### audit_aria

Restricts the run to ARIA roles, attributes, and name-role-value rules.

```ts
await callTool('audit_aria', { html });
```

### audit_table

Restricts the run to table-accessibility rules (headers, scope, data cells).

```ts
await callTool('audit_table', { html });
```

### audit_form

Restricts the run to form-accessibility rules (labels, autocomplete, field names).

```ts
await callTool('audit_form', { html });
```

### audit_heading

Restricts the run to heading + landmark rules (order, empty headings, regions).

```ts
await callTool('audit_heading', { html });
```

### heading_structure

Pure-parse heading outliner. Detects skipped levels, missing or multiple `h1`, and empty headings without invoking axe.

**Input:**

```ts
{ html: string }
```

**Output:**

```ts
{
  outline: Array<{ level: 1|2|3|4|5|6, text: string, line?: number }>,
  issues: Array<{ kind: 'skipped' | 'multiple_h1' | 'missing_h1' | 'empty', ... }>,
}
```

**Example:**

```ts
await callTool('heading_structure', {
  html: '<h1>Title</h1><h3>Skips h2</h3>',
});
// issues includes { kind: 'skipped' }
```

### wcag_score

Score HTML against WCAG 2.2 success criteria across A/AA/AAA conformance levels and emit a markdown compliance report.

**Input:**

```ts
{
  html: string,
  target_level?: 'A' | 'AA' | 'AAA',  // default 'AA'
}
```

**Output:**

```ts
{
  score: number,                     // 0..100
  target_level: 'A' | 'AA' | 'AAA',
  by_principle: Record<string, { passes: number, violations: number }>,
  markdown_report: string,
}
```

**Example:**

```ts
await callTool('wcag_score', { html, target_level: 'AA' });
```

### aria_validate

Pure-parse WAI-ARIA 1.2 validator. Reports invalid roles, missing required props, prohibited props, redundant roles, invalid prop values.

**Input:**

```ts
{ html: string }
```

**Output:**

```ts
{
  issues: Array<{
    kind: 'invalid_role' | 'missing_required' | 'prohibited' | 'redundant' | 'invalid_value',
    role?: string,
    attr?: string,
    target: string,         // CSS selector
    message: string,
  }>,
}
```

**Example:**

```ts
await callTool('aria_validate', {
  html: '<div role="bogus"></div>',
});
```

### link_text_check

Pure-parse link-text auditor. Flags vague phrases ("click here"), URL-as-text, empty links, and duplicate text pointing at different `href`s. Emits a `suggested_text` fallback chain (`aria-label` → `title` → preceding heading).

**Input:**

```ts
{ html: string }
```

**Output:**

```ts
{
  issues: Array<{
    kind: 'vague' | 'url_as_text' | 'empty' | 'duplicate_text_diff_href',
    target: string,
    text: string,
    href?: string,
    suggested_text?: string,
  }>,
}
```

**Example:**

```ts
await callTool('link_text_check', {
  html: '<a href="/help">click here</a>',
});
```

### document_accessibility

PDF accessibility audit. Inspects the tagged-tree presence, `MarkInfo`, language, title, `Figure`/`Alt` coverage, AcroForm field labeling, and reading-order signal. Emits a weighted 0-100 score.

**Input:**

```ts
{ pdf_path: string }              // absolute path to a PDF on disk
```

**Output:**

```ts
{
  score: number,                  // 0..100
  signals: {
    tagged: boolean,
    mark_info: boolean,
    has_language: boolean,
    has_title: boolean,
    figure_alt_coverage: number,  // 0..1
    form_labeled_coverage: number,
    reading_order_signal: boolean,
  },
  issues: string[],
}
```

**Example:**

```ts
await callTool('document_accessibility', {
  pdf_path: '/abs/path/to/report.pdf',
});
```

## Direct TypeScript usage

```ts
import { auditHtml } from '@standardbeagle/a11y-audit/tools/audit-html.js';
import { headingStructure } from '@standardbeagle/a11y-audit/tools/heading-structure.js';
import { wcagScore } from '@standardbeagle/a11y-audit/tools/wcag-score.js';
import { ariaValidate } from '@standardbeagle/a11y-audit/tools/aria-validate.js';
import { linkTextCheck } from '@standardbeagle/a11y-audit/tools/link-text-check.js';
import { pdfA11y } from '@standardbeagle/a11y-audit/tools/pdf-a11y.js';

const result = await auditHtml({ html: '<html>...</html>' });
```

## License

MIT
