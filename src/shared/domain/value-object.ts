/**
 * Base class for value objects: immutable, compared by value rather than identity.
 */
export abstract class ValueObject<T> {
  protected constructor(readonly value: T) {
    Object.freeze(this);
  }

  equals(other: ValueObject<T> | null | undefined): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return isDeepEqual(this.value, other.value);
  }

  toString(): string {
    return String(this.value);
  }
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isDeepEqual(item, b[index]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return keysA.length === keysB.length && keysA.every((key) => isDeepEqual(a[key], b[key]));
  }
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}
