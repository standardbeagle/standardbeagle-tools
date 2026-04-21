import { describe, it, expect } from 'vitest';
import { isHex, isRGB, clampChannel, assertColor } from './validate.js';
import { InvalidColorError } from '../errors.js';

describe('isHex', () => {
  it('accepts valid 3-digit hex', () => {
    expect(isHex('#fff')).toBe(true);
  });

  it('accepts valid 6-digit hex', () => {
    expect(isHex('#ffffff')).toBe(true);
  });

  it('accepts valid 8-digit hex', () => {
    expect(isHex('#ffffffff')).toBe(true);
  });

  it('rejects invalid hex characters', () => {
    expect(isHex('#fg0')).toBe(false);
  });

  it('rejects named colors', () => {
    expect(isHex('white')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isHex('')).toBe(false);
  });
});

describe('isRGB', () => {
  it('accepts valid RGB', () => {
    expect(isRGB({ r: 0, g: 0, b: 0 })).toBe(true);
  });

  it('rejects out-of-range red', () => {
    expect(isRGB({ r: 256, g: 0, b: 0 })).toBe(false);
  });

  it('rejects missing channels', () => {
    expect(isRGB({ r: 0 })).toBe(false);
  });

  it('rejects null', () => {
    expect(isRGB(null)).toBe(false);
  });
});

describe('clampChannel', () => {
  it('clamps above max', () => {
    expect(clampChannel(300, 0, 255)).toBe(255);
  });

  it('clamps below min', () => {
    expect(clampChannel(-5, 0, 255)).toBe(0);
  });

  it('passes through in-range values', () => {
    expect(clampChannel(128, 0, 255)).toBe(128);
  });
});

describe('assertColor', () => {
  it('passes for valid hex', () => {
    expect(() => assertColor('#fff', 'hex')).not.toThrow();
  });

  it('throws InvalidColorError for invalid hex', () => {
    expect(() => assertColor('#fg0', 'hex')).toThrow(InvalidColorError);
  });

  it('passes for valid rgb', () => {
    expect(() => assertColor({ r: 0, g: 0, b: 0 }, 'rgb')).not.toThrow();
  });

  it('throws InvalidColorError for invalid rgb', () => {
    expect(() => assertColor({ r: 256, g: 0, b: 0 }, 'rgb')).toThrow(InvalidColorError);
  });
});
