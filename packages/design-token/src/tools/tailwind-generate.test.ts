import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { tailwindGenerate } from './tailwind-generate.js';
import { TailwindGenerateInputSchema } from './tailwind-generate.schema.js';

const FIXTURE_PALETTE = {
  primary: '#0066cc',
  secondary: '#ff6600',
  green: '#22c55e',
  red: '#ef4444',
};

const FIXTURE_INPUT = {
  palette: FIXTURE_PALETTE,
  type_scale: { base: 16, ratio: 1.25 },
  spacing: { base: 4, steps: 4 },
};

describe('tailwind_generate input schema', () => {
  it('output_format defaults to object', () => {
    const parsed = TailwindGenerateInputSchema.parse(FIXTURE_INPUT);
    expect(parsed.output_format).toBe('object');
  });

  it('rejects unknown output_format values', () => {
    expect(() =>
      TailwindGenerateInputSchema.parse({ ...FIXTURE_INPUT, output_format: 'esm' }),
    ).toThrow();
  });
});

describe('tailwind_generate full pipeline (F2 → F5)', () => {
  it('produces colors, fontSize, spacing slots from palette + scale + spacing', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'object' });
    const cfg = out.config as {
      colors: Record<string, string>;
      fontSize: Record<string, string>;
      spacing: Record<string, string>;
    };

    // colors slot mirrors palette
    expect(cfg.colors.primary).toBe('#0066cc');
    expect(cfg.colors.secondary).toBe('#ff6600');
    expect(cfg.colors.green).toBe('#22c55e');
    expect(cfg.colors.red).toBe('#ef4444');

    // fontSize slot has the canonical 9-step modular scale
    expect(cfg.fontSize.body).toBe('16px');
    expect(cfg.fontSize.h1).toBeDefined();
    expect(cfg.fontSize.caption).toBeDefined();

    // spacing slot has steps 0..4 inclusive (5 entries)
    expect(Object.keys(cfg.spacing).sort()).toEqual(['0', '1', '2', '3', '4']);
    expect(cfg.spacing['0']).toBe('0px');
    expect(cfg.spacing['1']).toBe('4px');
    expect(cfg.spacing['4']).toBe('16px');
  });

  it('output_format=object returns only config (no code)', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'object' });
    expect(out.config).toBeDefined();
    expect(out.code).toBeUndefined();
  });

  it('is deterministic — same input → byte-identical JSON.stringify', () => {
    const a = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'object' });
    const b = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'object' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('tailwind_generate semantic_map injection', () => {
  it('aliases resolve to the palette hex value (not a {ref} string)', () => {
    const out = tailwindGenerate({
      ...FIXTURE_INPUT,
      semantic_map: { success: 'green', danger: 'red' },
      output_format: 'object',
    });
    const colors = (out.config as { colors: Record<string, string> }).colors;
    expect(colors.success).toBe('#22c55e'); // = palette.green
    expect(colors.danger).toBe('#ef4444'); // = palette.red
    // original palette keys still present
    expect(colors.primary).toBe('#0066cc');
    expect(colors.green).toBe('#22c55e');
  });

  it('alias name that shadows an existing palette key overwrites it (last-write-wins)', () => {
    // {primary: 'green'} aliases the SEMANTIC name 'primary' to palette.green's value.
    // Since palette already had a 'primary' key, the alias overwrites it. Documented
    // behavior — caller is expected to choose alias names that don't shadow palette keys
    // unless they intend to reassign.
    const out = tailwindGenerate({
      ...FIXTURE_INPUT,
      semantic_map: { primary: 'green' },
      output_format: 'object',
    });
    const colors = (out.config as { colors: Record<string, string> }).colors;
    expect(colors.primary).toBe('#22c55e'); // overwritten with palette.green's value
  });

  it('throws when an alias target is not in the palette', () => {
    expect(() =>
      tailwindGenerate({
        ...FIXTURE_INPUT,
        semantic_map: { success: 'nonexistent' },
        output_format: 'object',
      }),
    ).toThrow(/no entry "nonexistent"/);
  });

  it('omitted semantic_map → only palette colors emitted', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'object' });
    const colors = (out.config as { colors: Record<string, string> }).colors;
    expect(Object.keys(colors).sort()).toEqual(
      ['green', 'primary', 'red', 'secondary'],
    );
  });

  it('semantic alias keys are sorted alphabetically with palette keys for determinism', () => {
    const out = tailwindGenerate({
      ...FIXTURE_INPUT,
      semantic_map: { success: 'green', danger: 'red' },
      output_format: 'object',
    });
    const colors = (out.config as { colors: Record<string, string> }).colors;
    expect(Object.keys(colors)).toEqual(
      // alphabetical: danger, green, primary, red, secondary, success
      ['danger', 'green', 'primary', 'red', 'secondary', 'success'],
    );
  });
});

describe('tailwind_generate output_format=js-module', () => {
  it('returns config + code, code is CommonJS source', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'js-module' });
    expect(out.config).toBeDefined();
    expect(out.code).toBeDefined();
    expect(out.code!).toContain('module.exports');
    expect(out.code!).toContain('theme:');
    expect(out.code!).toContain('extend:');
    // hex values from palette appear in the source
    expect(out.code!).toContain('"#0066cc"');
  });

  it('emitted JS source is syntactically parseable', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'js-module' });
    // Parse via TS in JS mode (allowJs); zero diagnostics = valid syntax.
    const sf = ts.createSourceFile(
      'generated.cjs.js',
      out.code!,
      ts.ScriptTarget.ES2020,
      /* setParentNodes */ false,
      ts.ScriptKind.JS,
    );
    // ts.SourceFile carries parse diagnostics on `parseDiagnostics`, exposed
    // via the bundled-types' internal field. Use the public surface: a freshly
    // parsed source file with a syntax error would have a non-empty
    // `parseDiagnostics`. Cast to access.
    const diagnostics = (sf as unknown as { parseDiagnostics: ts.Diagnostic[] })
      .parseDiagnostics;
    expect(diagnostics).toEqual([]);
  });
});

describe('tailwind_generate output_format=ts-module', () => {
  it('returns config + code, code is ESM TS source with satisfies', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'ts-module' });
    expect(out.config).toBeDefined();
    expect(out.code).toBeDefined();
    expect(out.code!).toContain("import type { Config } from 'tailwindcss'");
    expect(out.code!).toContain('export default');
    expect(out.code!).toContain('satisfies');
    expect(out.code!).toContain("Pick<Config, 'theme'>");
    expect(out.code!).toContain('"#0066cc"');
  });

  it('emitted TS source is syntactically parseable (zero parse diagnostics)', () => {
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'ts-module' });
    const sf = ts.createSourceFile(
      'generated.tailwind.ts',
      out.code!,
      ts.ScriptTarget.ES2020,
      /* setParentNodes */ false,
      ts.ScriptKind.TS,
    );
    const diagnostics = (sf as unknown as { parseDiagnostics: ts.Diagnostic[] })
      .parseDiagnostics;
    expect(diagnostics).toEqual([]);
  });

  it('emitted TS source compiles cleanly (no syntactic errors via transpileModule)', () => {
    // transpileModule strips types and reports any structural issues; running
    // it end-to-end is a stronger guarantee than parsing alone.
    const out = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'ts-module' });
    const result = ts.transpileModule(out.code!, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        // We don't have tailwindcss types in this isolated transpile, so skip
        // type-checking — we're only validating syntactic well-formedness.
        noResolve: true,
        isolatedModules: true,
      },
      reportDiagnostics: true,
    });
    // Filter out missing-module diagnostics for 'tailwindcss' (expected, since
    // we don't load real types here). Any other diagnostic indicates a real
    // syntax problem in our generated source.
    const real = (result.diagnostics ?? []).filter((d) => {
      const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      return !msg.includes('tailwindcss');
    });
    expect(real).toEqual([]);
    expect(result.outputText).toContain('export default');
  });
});

describe('tailwind_generate orchestrator boundaries', () => {
  it('semantic_map combined with ts-module emits aliases in the source', () => {
    const out = tailwindGenerate({
      ...FIXTURE_INPUT,
      semantic_map: { success: 'green' },
      output_format: 'ts-module',
    });
    expect(out.code!).toContain('"success": "#22c55e"');
  });

  it('all 3 output formats agree on the config object shape', () => {
    const a = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'object' });
    const b = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'js-module' });
    const c = tailwindGenerate({ ...FIXTURE_INPUT, output_format: 'ts-module' });
    expect(JSON.stringify(a.config)).toBe(JSON.stringify(b.config));
    expect(JSON.stringify(b.config)).toBe(JSON.stringify(c.config));
  });
});
