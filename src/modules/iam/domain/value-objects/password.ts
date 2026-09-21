import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

/** A plaintext password that satisfies the password policy. Never persisted. */
export class Password extends ValueObject<string> {
  static create(raw: string): Password {
    if (raw.length < PASSWORD_MIN_LENGTH || raw.length > PASSWORD_MAX_LENGTH) {
      throw new InvariantViolationError(
        `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
        { field: 'password' },
      );
    }
    return new Password(raw);
  }

  override toString(): string {
    return '[REDACTED]';
  }
}
