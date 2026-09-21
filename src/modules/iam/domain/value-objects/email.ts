import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalised (trimmed, lower-cased) e-mail address. */
export class Email extends ValueObject<string> {
  static create(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (value.length === 0 || value.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(value)) {
      throw new InvariantViolationError('E-mail address is invalid', { field: 'email' });
    }
    return new Email(value);
  }
}
