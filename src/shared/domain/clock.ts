/**
 * Port for "what time is it". Domain logic depends on this rather than `new Date()`
 * so that time-based rules are deterministic in tests.
 */
export interface Clock {
  now(): Date;
}

export const CLOCK = Symbol('Clock');
