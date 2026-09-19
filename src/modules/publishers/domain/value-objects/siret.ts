import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export const SIRET_LENGTH = 14;
const SIRET_PATTERN = /^\d{14}$/;

/**
 * French establishment identifier (SIRET): 14 digits validated with the Luhn algorithm.
 * Stored as a string because leading zeros are significant.
 */
export class Siret extends ValueObject<string> {
  static create(raw: string): Siret {
    const value = raw.replaceAll(/\s+/g, '');
    if (!SIRET_PATTERN.test(value)) {
      throw new InvariantViolationError(`SIRET must be exactly ${SIRET_LENGTH} digits`, {
        field: 'siret',
      });
    }
    if (!passesLuhn(value)) {
      throw new InvariantViolationError('SIRET checksum is invalid', { field: 'siret' });
    }
    return new Siret(value);
  }

  /** The SIREN (company identifier) is the first nine digits of the SIRET. */
  get siren(): string {
    return this.value.slice(0, 9);
  }
}

function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
