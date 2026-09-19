/**
 * Subtracts calendar months from a date, clamping to the last day of the target month
 * (e.g. 31 March - 1 month = 28/29 February). `Date#setMonth` would overflow instead.
 */
export function subtractMonths(date: Date, months: number): Date {
  if (!Number.isInteger(months) || months < 0) {
    throw new RangeError('months must be a non-negative integer');
  }
  const result = new Date(date.getTime());
  const targetMonthIndex = result.getUTCMonth() - months;
  const dayOfMonth = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(targetMonthIndex);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(dayOfMonth, lastDayOfTargetMonth));

  return result;
}
