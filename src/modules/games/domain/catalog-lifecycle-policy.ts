import { subtractMonths } from '../../../shared/domain/index.js';

export interface CatalogLifecycleRules {
  /** Games released strictly more than this many months ago are retired (deleted). */
  readonly retirementAgeMonths: number;
  /** Games released between `retirementAgeMonths` and this many months ago are discounted. */
  readonly discountAgeMonths: number;
  /** Whole-number percentage applied once per game. */
  readonly discountPercentage: number;
}

export const DEFAULT_CATALOG_LIFECYCLE_RULES: CatalogLifecycleRules = Object.freeze({
  retirementAgeMonths: 18,
  discountAgeMonths: 12,
  discountPercentage: 20,
});

export interface DateWindow {
  /** Inclusive lower bound. */
  readonly from: Date;
  /** Inclusive upper bound. */
  readonly to: Date;
}

/**
 * Domain service encoding the catalog ageing rules. Pure: it depends only on the
 * reference time passed in, so the same input always yields the same boundaries.
 */
export class CatalogLifecyclePolicy {
  constructor(readonly rules: CatalogLifecycleRules = DEFAULT_CATALOG_LIFECYCLE_RULES) {
    if (rules.discountAgeMonths >= rules.retirementAgeMonths) {
      throw new RangeError('discountAgeMonths must be lower than retirementAgeMonths');
    }
  }

  /** Games released before this instant are retired. */
  retirementCutoff(now: Date): Date {
    return subtractMonths(now, this.rules.retirementAgeMonths);
  }

  /** Games released inside this window (and not yet discounted) get the discount. */
  discountWindow(now: Date): DateWindow {
    return {
      from: this.retirementCutoff(now),
      to: subtractMonths(now, this.rules.discountAgeMonths),
    };
  }

  get discountPercentage(): number {
    return this.rules.discountPercentage;
  }
}
