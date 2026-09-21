import { describe, expect, it } from 'vitest';

import { InvariantViolationError } from '../../../../shared/domain/index.js';
import { Siret } from './siret.js';

describe('Siret', () => {
  it('accepts a valid 14-digit SIRET and exposes the SIREN', () => {
    const siret = Siret.create('732 829 320 00074');
    expect(siret.value).toBe('73282932000074');
    expect(siret.siren).toBe('732829320');
  });

  it('rejects wrong length or non-digits', () => {
    expect(() => Siret.create('7328293200007')).toThrow(InvariantViolationError);
    expect(() => Siret.create('7328293200007A')).toThrow(InvariantViolationError);
  });

  it('rejects an invalid checksum', () => {
    expect(() => Siret.create('73282932000075')).toThrow(/checksum/);
  });
});
