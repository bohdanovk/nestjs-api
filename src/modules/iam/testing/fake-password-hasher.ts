import type { PasswordHasher } from '../application/ports/password-hasher.js';

/** Reversible, obviously-insecure hasher for unit tests. */
export class FakePasswordHasher implements PasswordHasher {
  hash(plaintext: string): Promise<string> {
    return Promise.resolve(`hashed:${plaintext}`);
  }

  verify(hash: string, plaintext: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plaintext}`);
  }
}
