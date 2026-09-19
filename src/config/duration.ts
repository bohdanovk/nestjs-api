const UNIT_SECONDS: Readonly<Record<string, number>> = {
  ms: 0.001,
  s: 1,
  m: 60,
  h: 3_600,
  d: 86_400,
};

/** Converts `15m`, `12h`, `7d`, `500ms` into whole seconds. */
export function durationToSeconds(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(duration);
  if (match === null) {
    throw new TypeError(`Invalid duration "${duration}"`);
  }
  const [, amount, unit] = match;
  return Math.round(Number(amount) * (UNIT_SECONDS[unit ?? 's'] ?? 1));
}
