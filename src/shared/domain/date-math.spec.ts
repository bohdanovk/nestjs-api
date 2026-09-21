import { describe, expect, it } from 'vitest';

import { subtractMonths } from './date-math.js';

describe('subtractMonths', () => {
  it('subtracts whole months keeping the day of month', () => {
    expect(subtractMonths(new Date('2026-09-19T12:00:00.000Z'), 18)).toEqual(
      new Date('2025-03-19T12:00:00.000Z'),
    );
  });

  it('clamps to the last day of the target month instead of overflowing', () => {
    expect(subtractMonths(new Date('2026-03-31T00:00:00.000Z'), 1)).toEqual(
      new Date('2026-02-28T00:00:00.000Z'),
    );
    expect(subtractMonths(new Date('2024-03-31T00:00:00.000Z'), 1)).toEqual(
      new Date('2024-02-29T00:00:00.000Z'),
    );
  });

  it('crosses year boundaries', () => {
    expect(subtractMonths(new Date('2026-01-15T00:00:00.000Z'), 13)).toEqual(
      new Date('2024-12-15T00:00:00.000Z'),
    );
  });

  it('returns a new instance and leaves the input untouched', () => {
    const input = new Date('2026-06-01T00:00:00.000Z');
    const output = subtractMonths(input, 0);
    expect(output).not.toBe(input);
    expect(output).toEqual(input);
  });

  it('rejects negative or fractional months', () => {
    expect(() => subtractMonths(new Date(), -1)).toThrow(RangeError);
    expect(() => subtractMonths(new Date(), 1.5)).toThrow(RangeError);
  });
});
