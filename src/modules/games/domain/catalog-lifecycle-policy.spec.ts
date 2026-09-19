import { describe, expect, it } from 'vitest';

import { CatalogLifecyclePolicy } from './catalog-lifecycle-policy.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');

describe('CatalogLifecyclePolicy', () => {
  it('uses the default rules: retire after 18 months, discount 20% between 12 and 18 months', () => {
    const policy = new CatalogLifecyclePolicy();

    expect(policy.retirementCutoff(NOW)).toEqual(new Date('2025-03-19T12:00:00.000Z'));
    expect(policy.discountWindow(NOW)).toEqual({
      from: new Date('2025-03-19T12:00:00.000Z'),
      to: new Date('2025-09-19T12:00:00.000Z'),
    });
    expect(policy.discountPercentage).toBe(20);
  });

  it('accepts custom rules', () => {
    const policy = new CatalogLifecyclePolicy({
      retirementAgeMonths: 24,
      discountAgeMonths: 6,
      discountPercentage: 50,
    });

    expect(policy.retirementCutoff(NOW)).toEqual(new Date('2024-09-19T12:00:00.000Z'));
    expect(policy.discountWindow(NOW).to).toEqual(new Date('2026-03-19T12:00:00.000Z'));
  });

  it('rejects a discount window that does not precede retirement', () => {
    expect(
      () =>
        new CatalogLifecyclePolicy({
          retirementAgeMonths: 12,
          discountAgeMonths: 12,
          discountPercentage: 20,
        }),
    ).toThrow(RangeError);
  });
});
