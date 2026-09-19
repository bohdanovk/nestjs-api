import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';

import type { PasswordHasher } from '../../application/ports/password-hasher.js';

/** Argon2id with the OWASP-recommended baseline parameters. */
@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  private static readonly OPTIONS: argon2.HashOptions = {
    type: argon2.argon2id,
    memoryCost: 19_456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  };

  hash(plaintext: string): Promise<string> {
    return argon2.hash(plaintext, Argon2PasswordHasher.OPTIONS);
  }

  async verify(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      return false;
    }
  }
}
