import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export interface DiscountProps {
  /** Whole-number percentage, 1..100. */
  readonly percentage: number;
  readonly appliedAt: Date;
}

/** A price reduction that has been applied to a game. */
export class Discount extends ValueObject<DiscountProps> {
  static create(percentage: number, appliedAt: Date): Discount {
    if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) {
      throw new InvariantViolationError(
        'Discount percentage must be an integer between 1 and 100',
        {
          field: 'percentage',
        },
      );
    }
    return new Discount({ percentage, appliedAt });
  }

  get percentage(): number {
    return this.value.percentage;
  }

  get appliedAt(): Date {
    return this.value.appliedAt;
  }
}
