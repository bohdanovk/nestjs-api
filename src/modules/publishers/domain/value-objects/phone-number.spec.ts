import { describe, expect, it } from 'vitest';

import { InvariantViolationError } from '../../../../shared/domain/index.js';
import { PhoneNumber } from './phone-number.js';

describe('PhoneNumber', () => {
  it('normalises common formatting to E.164', () => {
    expect(PhoneNumber.create('+33 1 23 45 67 89').value).toBe('+33123456789');
    expect(PhoneNumber.create('+1 (888) 777-0446').value).toBe('+18887770446');
  });

  it('rejects numbers that are not E.164', () => {
    expect(() => PhoneNumber.create('0123456789')).toThrow(InvariantViolationError);
    expect(() => PhoneNumber.create('+0123')).toThrow(InvariantViolationError);
    expect(() => PhoneNumber.create('+1234567890123456')).toThrow(InvariantViolationError);
  });
});
