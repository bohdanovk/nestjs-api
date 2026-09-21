import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export const MAX_TAGS = 20;
export const TAG_MAX_LENGTH = 30;

/** Normalised (trimmed, lower-case), de-duplicated, ordered set of tags. */
export class Tags extends ValueObject<readonly string[]> {
  static readonly EMPTY = new Tags([]);

  static create(raw: readonly string[]): Tags {
    const normalised = [...new Set(raw.map((tag) => tag.trim().toLowerCase()))];
    if (normalised.length > MAX_TAGS) {
      throw new InvariantViolationError(`A game may have at most ${MAX_TAGS} tags`, {
        field: 'tags',
        max: MAX_TAGS,
      });
    }
    for (const tag of normalised) {
      if (tag.length === 0 || tag.length > TAG_MAX_LENGTH) {
        throw new InvariantViolationError(
          `Each tag must be between 1 and ${TAG_MAX_LENGTH} characters`,
          { field: 'tags', tag },
        );
      }
    }
    return new Tags(Object.freeze(normalised));
  }

  has(tag: string): boolean {
    return this.value.includes(tag.trim().toLowerCase());
  }

  get size(): number {
    return this.value.length;
  }
}
