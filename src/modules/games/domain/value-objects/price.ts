import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

/** Upper bound for a price expressed in major units (e.g. euros). */
export const MAX_PRICE = 999_999.99;
const CENTS_PER_UNIT = 100;

/**
 * Monetary amount stored as integer minor units (cents) to avoid floating-point drift.
 * A price of 0 means the game is free. Single currency is assumed for the catalog.
 */
export class Price extends ValueObject<number> {
  static fromDecimal(amount: number): Price {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new InvariantViolationError('Price must be a non-negative number', { field: 'price' });
    }
    if (amount > MAX_PRICE) {
      throw new InvariantViolationError(`Price must not exceed ${MAX_PRICE}`, {
        field: 'price',
        max: MAX_PRICE,
      });
    }
    const cents = Math.round(amount * CENTS_PER_UNIT);
    if (Math.abs(amount * CENTS_PER_UNIT - cents) > 1e-6) {
      throw new InvariantViolationError('Price must have at most two decimal places', {
        field: 'price',
      });
    }
    return new Price(cents);
  }

  static fromCents(cents: number): Price {
    if (!Number.isInteger(cents) || cents < 0 || cents > MAX_PRICE * CENTS_PER_UNIT) {
      throw new InvariantViolationError('Price in cents must be a non-negative integer', {
        field: 'price',
      });
    }
    return new Price(cents);
  }

  get cents(): number {
    return this.value;
  }

  toDecimal(): number {
    return this.value / CENTS_PER_UNIT;
  }

  /** Returns a new price reduced by `percentage`, rounded to the nearest cent. */
  discountedBy(percentage: number): Price {
    return new Price(Math.round((this.value * (100 - percentage)) / 100));
  }

  get isFree(): boolean {
    return this.value === 0;
  }
}
