import { describe, expect, it } from 'vitest';

import { InvariantViolationError } from './domain-error.js';
import { EntityId } from './entity-id.js';

class SampleId extends EntityId {
  static create(value: string): SampleId {
    return new SampleId(value);
  }

  static generate(): SampleId {
    return new SampleId(EntityId.newValue());
  }
}

class OtherId extends EntityId {
  static create(value: string): OtherId {
    return new OtherId(value);
  }
}

describe('EntityId', () => {
  it('generates valid, unique identifiers', () => {
    const a = SampleId.generate();
    const b = SampleId.generate();
    expect(a.value).toMatch(/^[0-9a-f-]{36}$/);
    expect(a.equals(b)).toBe(false);
  });

  it('rejects malformed identifiers', () => {
    expect(() => SampleId.create('not-a-uuid')).toThrow(InvariantViolationError);
    expect(() => SampleId.create('')).toThrow(InvariantViolationError);
  });

  it('normalises to lower case and compares by value and type', () => {
    const upper = SampleId.create('2F1B7F60-6E5F-4C4E-9F19-8B8E0C4F9D21');
    const lower = SampleId.create('2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21');
    expect(upper.value).toBe(lower.value);
    expect(upper.equals(lower)).toBe(true);
    expect(upper.equals(OtherId.create(lower.value))).toBe(false);
  });
});
