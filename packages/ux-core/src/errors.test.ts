import { describe, it, expect } from 'vitest';
import { UXCoreError, InvalidColorError, OutOfRangeError, UnsupportedSpaceError } from './errors.js';

describe('Error classes', () => {
  it('InvalidColorError instanceof UXCoreError instanceof Error', () => {
    const err = new InvalidColorError('#fg0');
    expect(err).toBeInstanceOf(InvalidColorError);
    expect(err).toBeInstanceOf(UXCoreError);
    expect(err).toBeInstanceOf(Error);
  });

  it('each subclass has unique code', () => {
    const invalidColor = new InvalidColorError('bad');
    const outOfRange = new OutOfRangeError(300, 'r', 0, 255);
    const unsupportedSpace = new UnsupportedSpaceError('xyz');

    expect(invalidColor.code).toBe('E_INVALID_COLOR');
    expect(outOfRange.code).toBe('E_OUT_OF_RANGE');
    expect(unsupportedSpace.code).toBe('E_UNSUPPORTED_SPACE');

    const codes = [invalidColor.code, outOfRange.code, unsupportedSpace.code];
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('InvalidColorError message includes offending value', () => {
    const err = new InvalidColorError('#fg0', 'hex');
    expect(err.message).toContain('#fg0');
    expect(err.message).toContain('hex');
  });

  it('OutOfRangeError message includes param and bounds', () => {
    const err = new OutOfRangeError(300, 'r', 0, 255);
    expect(err.message).toContain('300');
    expect(err.message).toContain('r');
    expect(err.message).toContain('0..255');
  });

  it('UnsupportedSpaceError message includes space', () => {
    const err = new UnsupportedSpaceError('cmyk');
    expect(err.message).toContain('cmyk');
  });
});
