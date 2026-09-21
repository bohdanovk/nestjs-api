import { describe, expect, it } from 'vitest';

import { InvariantViolationError } from '../../../../shared/domain/index.js';
import { MAX_TAGS, Tags } from './tags.js';

describe('Tags', () => {
  it('normalises and de-duplicates', () => {
    const tags = Tags.create([' Action ', 'action', 'VR']);
    expect(tags.value).toEqual(['action', 'vr']);
    expect(tags.has('Action')).toBe(true);
    expect(tags.size).toBe(2);
  });

  it('accepts an empty list', () => {
    expect(Tags.create([]).size).toBe(0);
    expect(Tags.EMPTY.equals(Tags.create([]))).toBe(true);
  });

  it('rejects blank, overlong or too many tags', () => {
    expect(() => Tags.create(['  '])).toThrow(InvariantViolationError);
    expect(() => Tags.create(['x'.repeat(31)])).toThrow(InvariantViolationError);
    expect(() =>
      Tags.create(Array.from({ length: MAX_TAGS + 1 }, (_, index) => `tag-${index}`)),
    ).toThrow(InvariantViolationError);
  });
});
