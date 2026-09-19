import { describe, expect, it } from 'vitest';

import { InvariantViolationError } from '../../../../shared/domain/index.js';
import { MAX_PRICE, Price } from './price.js';

describe('Price', () => {
  it('stores amounts as integer cents', () => {
    expect(Price.fromDecimal(19.99).cents).toBe(1999);
    expect(Price.fromDecimal(0).cents).toBe(0);
    expect(Price.fromDecimal(0.1 + 0.2).cents).toBe(30);
  });

  it('round-trips to decimals', () => {
    expect(Price.fromCents(1999).toDecimal()).toBe(19.99);
  });

  it('rejects negative, non-finite, over-limit and sub-cent amounts', () => {
    expect(() => Price.fromDecimal(-1)).toThrow(InvariantViolationError);
    expect(() => Price.fromDecimal(Number.NaN)).toThrow(InvariantViolationError);
    expect(() => Price.fromDecimal(Number.POSITIVE_INFINITY)).toThrow(InvariantViolationError);
    expect(() => Price.fromDecimal(MAX_PRICE + 1)).toThrow(InvariantViolationError);
    expect(() => Price.fromDecimal(1.005)).toThrow(InvariantViolationError);
    expect(() => Price.fromCents(1.5)).toThrow(InvariantViolationError);
  });

  it('applies percentage discounts rounded to the nearest cent', () => {
    expect(Price.fromDecimal(50).discountedBy(20).toDecimal()).toBe(40);
    expect(Price.fromDecimal(19.99).discountedBy(20).cents).toBe(1599);
    expect(Price.fromDecimal(0).discountedBy(20).isFree).toBe(true);
  });

  it('compares by value', () => {
    expect(Price.fromDecimal(10).equals(Price.fromCents(1000))).toBe(true);
    expect(Price.fromDecimal(10).equals(Price.fromCents(1001))).toBe(false);
  });
});
