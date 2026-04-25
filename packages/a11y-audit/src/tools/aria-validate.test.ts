import { describe, it, expect } from 'vitest';
import { ariaValidate } from './aria-validate.js';
import { ARIA_ROLES, ARIA_ROLE_INDEX } from '../lib/aria-roles.js';

describe('ariaValidate', () => {
  it('flags an unknown role as invalid-role', async () => {
    const { issues } = await ariaValidate({ html: "<div role='banana'>x</div>" });
    expect(issues).toHaveLength(1);
    expect(issues[0]!.violation).toBe('invalid-role');
    expect(issues[0]!.role).toBe('banana');
    expect(issues[0]!.detail).toMatch(/banana/);
  });

  it('flags a redundant role on an HTML element with the same implicit role', async () => {
    const { issues } = await ariaValidate({
      html: "<button role='button'>Go</button>",
    });
    const redundant = issues.filter((i) => i.violation === 'redundant-role');
    expect(redundant).toHaveLength(1);
    expect(redundant[0]!.role).toBe('button');
    expect(redundant[0]!.detail).toMatch(/implicit role/);
  });

  it('flags missing-required-prop when role=checkbox lacks aria-checked', async () => {
    const { issues } = await ariaValidate({
      html: "<div role='checkbox'>x</div>",
    });
    const missing = issues.filter((i) => i.violation === 'missing-required-prop');
    expect(missing).toHaveLength(1);
    expect(missing[0]!.role).toBe('checkbox');
    expect(missing[0]!.detail).toMatch(/aria-checked/);
  });

  it('flags invalid-prop-value when aria-pressed is outside true|false|mixed|undefined', async () => {
    const { issues } = await ariaValidate({
      html: "<div role='button' aria-pressed='maybe'>x</div>",
    });
    const bad = issues.filter((i) => i.violation === 'invalid-prop-value');
    expect(bad).toHaveLength(1);
    expect(bad[0]!.detail).toMatch(/aria-pressed/);
    expect(bad[0]!.detail).toMatch(/maybe/);
  });

  it('emits no issues for a clean native button', async () => {
    const { issues } = await ariaValidate({ html: '<button>Click</button>' });
    expect(issues).toEqual([]);
  });

  it('emits no issues for a clean anchor with href', async () => {
    const { issues } = await ariaValidate({ html: "<a href='/'>Link</a>" });
    expect(issues).toEqual([]);
  });

  it('flags prohibited-prop when aria-label is set on role=presentation', async () => {
    // `presentation` carries aria-label/aria-labelledby in the prohibited list.
    const { issues } = await ariaValidate({
      html: "<div role='presentation' aria-label='hidden'>x</div>",
    });
    const prohibited = issues.filter((i) => i.violation === 'prohibited-prop');
    expect(prohibited).toHaveLength(1);
    expect(prohibited[0]!.role).toBe('presentation');
    expect(prohibited[0]!.detail).toMatch(/aria-label/);
  });

  it('does not flag elements with no role and no aria-* attributes', async () => {
    const { issues } = await ariaValidate({
      html: '<div><p>just text</p><span>more text</span></div>',
    });
    expect(issues).toEqual([]);
  });

  it('produces a stable selector preferring #id then role attribute', async () => {
    const { issues } = await ariaValidate({
      html: "<div id='cb' role='checkbox'></div>",
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]!.selector).toBe('#cb');
  });

  it('indexes at least 70 WAI-ARIA 1.2 roles', () => {
    expect(ARIA_ROLES.length).toBeGreaterThanOrEqual(70);
    expect(ARIA_ROLE_INDEX.size).toBeGreaterThanOrEqual(70);
    // Spot-check coverage of the four major buckets.
    expect(ARIA_ROLE_INDEX.has('button')).toBe(true); // widget
    expect(ARIA_ROLE_INDEX.has('main')).toBe(true); // landmark
    expect(ARIA_ROLE_INDEX.has('heading')).toBe(true); // structure
    expect(ARIA_ROLE_INDEX.has('alert')).toBe(true); // live-region
    expect(ARIA_ROLE_INDEX.has('dialog')).toBe(true); // window
  });

  it('does not flag implicit role on <a href> as redundant when role attr absent', async () => {
    // Ensures the implicit-role lookup only fires when the author actually
    // wrote a role attribute.
    const { issues } = await ariaValidate({
      html: "<a href='/foo'>link</a>",
    });
    expect(issues).toEqual([]);
  });

  it('flags redundant role on <a href="…" role="link">', async () => {
    const { issues } = await ariaValidate({
      html: "<a href='/foo' role='link'>link</a>",
    });
    const redundant = issues.filter((i) => i.violation === 'redundant-role');
    expect(redundant).toHaveLength(1);
    expect(redundant[0]!.role).toBe('link');
  });
});
