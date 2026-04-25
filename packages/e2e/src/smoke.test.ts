/**
 * E2E smoke test — exercise each MCP server with one canonical tool call.
 *
 * Strategy
 * --------
 *  - Spawn each server as a child process via its built `bin/mcp.js`
 *    (the same entrypoint published `npx @standardbeagle/<name>@latest mcp`
 *    will resolve to once Phase I1 publishes to npm).
 *  - Future-compat: when `SMOKE_USE_NPX=1`, switch to `npx -y` so CI can run
 *    the same suite against the published package without code changes.
 *  - Use `@modelcontextprotocol/sdk` Client + StdioClientTransport for the
 *    JSON-RPC handshake; the SDK is already a workspace devDependency.
 *  - Per-case 10s budget enforced via Promise.race against a timer.
 *  - try/finally guarantees the child is closed even on assertion failure.
 *
 * Determinism notes
 * -----------------
 *  - servers boot off `dist/`, so `pnpm -r build` must run before this suite.
 *  - tests assert structural shape + key fields, not exact serialization, so
 *    minor formatter changes inside tools won't make this brittle.
 */

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import { describe, expect, it } from 'vitest';

const PER_CASE_BUDGET_MS = 10_000;

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');

interface ServerSpec {
  /** Workspace package name (without scope), used both for the bin path and
   *  for the `npx -y @standardbeagle/<name>@latest` form. */
  name: 'color' | 'a11y-audit' | 'design-token' | 'typography' | 'image-processing';
}

function spawnArgsFor(spec: ServerSpec): { command: string; args: string[] } {
  if (process.env.SMOKE_USE_NPX === '1') {
    // Post-I1 mode: exercise the published package the same way end users will.
    return {
      command: 'npx',
      args: ['-y', `@standardbeagle/${spec.name}@latest`, 'mcp'],
    };
  }
  // Local mode: run the built bin shim directly. No network required.
  const binPath = resolve(REPO_ROOT, 'packages', spec.name, 'bin', 'mcp.js');
  return { command: process.execPath, args: [binPath] };
}

async function withClient<T>(
  spec: ServerSpec,
  body: (client: Client) => Promise<T>,
): Promise<T> {
  const { command, args } = spawnArgsFor(spec);
  const transport = new StdioClientTransport({
    command,
    args,
    // Inherit env so node version managers / sharp's prebuilt binaries resolve.
    env: { ...process.env } as Record<string, string>,
  });
  const client = new Client(
    { name: 'standardbeagle-smoke', version: '0.1.0' },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
    return await body(client);
  } finally {
    // close() awaits transport shutdown which sends SIGTERM to the child.
    await client.close().catch(() => {
      /* swallow — we're already in cleanup, child exit handled by transport */
    });
  }
}

async function withinBudget<T>(label: string, p: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label}: exceeded ${PER_CASE_BUDGET_MS}ms budget`)),
      PER_CASE_BUDGET_MS,
    );
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Pull the JSON payload out of an MCP `tools/call` response. All five servers
 *  return their tool result as a single text content block whose text is JSON. */
function parseToolJson(result: unknown): unknown {
  const r = result as { content?: Array<{ type: string; text?: string }> };
  const content = r.content;
  if (!Array.isArray(content) || content.length === 0) {
    throw new Error(`tool result missing content array: ${JSON.stringify(result)}`);
  }
  const first = content[0];
  if (!first || first.type !== 'text' || typeof first.text !== 'string') {
    throw new Error(`tool result first content not text: ${JSON.stringify(first)}`);
  }
  return JSON.parse(first.text);
}

describe('MCP server smoke (1 tool per server)', () => {
  it('color: contrast_check black on white ≈ 21:1', async () => {
    await withinBudget(
      'color.contrast_check',
      withClient({ name: 'color' }, async (client) => {
        const result = await client.callTool({
          name: 'contrast_check',
          arguments: { foreground: '#000', background: '#fff' },
        });
        const payload = parseToolJson(result) as { ratio?: number };
        expect(typeof payload.ratio).toBe('number');
        // WCAG max contrast is exactly 21; allow 0.1 slack for any rounding.
        expect(payload.ratio).toBeGreaterThan(20.9);
        expect(payload.ratio).toBeLessThanOrEqual(21);
      }),
    );
  });

  it('a11y-audit: heading_structure flags h1→h3 skip', async () => {
    await withinBudget(
      'a11y-audit.heading_structure',
      withClient({ name: 'a11y-audit' }, async (client) => {
        const result = await client.callTool({
          name: 'heading_structure',
          arguments: { html: '<h1>A</h1><h3>B</h3>' },
        });
        const payload = parseToolJson(result) as {
          issues?: Array<{ type?: string }>;
        };
        expect(Array.isArray(payload.issues)).toBe(true);
        expect(payload.issues!.length).toBeGreaterThanOrEqual(1);
        expect(payload.issues!.some((i) => i.type === 'skipped_level')).toBe(true);
      }),
    );
  });

  it('design-token: tokens_validate accepts a minimal DTCG color token', async () => {
    await withinBudget(
      'design-token.tokens_validate',
      withClient({ name: 'design-token' }, async (client) => {
        const result = await client.callTool({
          name: 'tokens_validate',
          arguments: {
            tokens: { color: { primary: { $value: '#f00', $type: 'color' } } },
          },
        });
        const payload = parseToolJson(result) as {
          valid?: boolean;
          errors?: unknown[];
        };
        expect(payload.valid).toBe(true);
        expect(Array.isArray(payload.errors)).toBe(true);
        expect(payload.errors).toHaveLength(0);
      }),
    );
  });

  it('typography: modular_scale defaults produce 9 steps', async () => {
    await withinBudget(
      'typography.modular_scale',
      withClient({ name: 'typography' }, async (client) => {
        const result = await client.callTool({
          name: 'modular_scale',
          arguments: { base: 16, ratio: 1.25 },
        });
        const payload = parseToolJson(result) as { scale?: unknown[] };
        expect(Array.isArray(payload.scale)).toBe(true);
        // Defaults: steps_down=2 + body + steps_up=6 = 9.
        expect(payload.scale!.length).toBe(9);
      }),
    );
  });

  it('image-processing: svg_optimize trims a commented SVG', async () => {
    await withinBudget(
      'image-processing.svg_optimize',
      withClient({ name: 'image-processing' }, async (client) => {
        const svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><!-- comment --><rect/></svg>';
        const result = await client.callTool({
          name: 'svg_optimize',
          arguments: { svg },
        });
        const payload = parseToolJson(result) as {
          reduction_percent?: number;
          optimized?: string;
        };
        expect(typeof payload.optimized).toBe('string');
        expect(typeof payload.reduction_percent).toBe('number');
        expect(payload.reduction_percent).toBeGreaterThan(0);
      }),
    );
  });
});
