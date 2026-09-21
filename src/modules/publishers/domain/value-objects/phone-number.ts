import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

/** E.164: a leading `+`, a non-zero first digit and at most 15 digits in total. */
export const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

/** Loose input shape: E.164 digits with optional spaces, dots, dashes and parentheses. */
export const PHONE_INPUT_PATTERN = /^\+[\d\s().-]{2,24}$/;

export class PhoneNumber extends ValueObject<string> {
  static create(raw: string): PhoneNumber {
    const value = raw.replaceAll(/[\s().-]/g, '');
    if (!E164_PATTERN.test(value)) {
      throw new InvariantViolationError('Phone number must be in E.164 format, e.g. +33123456789', {
        field: 'phone',
      });
    }
    return new PhoneNumber(value);
  }
}
