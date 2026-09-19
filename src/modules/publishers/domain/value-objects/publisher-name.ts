import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export const PUBLISHER_NAME_MAX_LENGTH = 100;

export class PublisherName extends ValueObject<string> {
  static create(raw: string): PublisherName {
    const value = raw.trim();
    if (value.length === 0) {
      throw new InvariantViolationError('Publisher name must not be empty', { field: 'name' });
    }
    if (value.length > PUBLISHER_NAME_MAX_LENGTH) {
      throw new InvariantViolationError(
        `Publisher name must be at most ${PUBLISHER_NAME_MAX_LENGTH} characters`,
        { field: 'name', maxLength: PUBLISHER_NAME_MAX_LENGTH },
      );
    }
    return new PublisherName(value);
  }
}
