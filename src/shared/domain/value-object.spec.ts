import { describe, expect, it } from 'vitest';

import { ValueObject } from './value-object.js';

class Money extends ValueObject<{ amount: number; currency: string }> {
  static of(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }
}

class Label extends ValueObject<string> {
  static of(value: string): Label {
    return new Label(value);
  }
}

describe('ValueObject', () => {
  it('is equal to another instance with the same value', () => {
    expect(Money.of(10, 'EUR').equals(Money.of(10, 'EUR'))).toBe(true);
    expect(Label.of('a').equals(Label.of('a'))).toBe(true);
  });

  it('is not equal when values differ', () => {
    expect(Money.of(10, 'EUR').equals(Money.of(10, 'USD'))).toBe(false);
    expect(Label.of('a').equals(Label.of('b'))).toBe(false);
  });

  it('is not equal to a different value-object type or to nothing', () => {
    expect(Label.of('a').equals(null)).toBe(false);
    expect(Label.of('a').equals(undefined)).toBe(false);
    expect(Money.of(1, 'x').equals(Label.of('x') as unknown as Money)).toBe(false);
  });

  it('is immutable', () => {
    const label = Label.of('fixed');
    expect(Object.isFrozen(label)).toBe(true);
  });
});
