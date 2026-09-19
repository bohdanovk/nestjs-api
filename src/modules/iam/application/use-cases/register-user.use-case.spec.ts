import { describe, expect, it } from 'vitest';

import { InvariantViolationError, Role } from '../../../../shared/domain/index.js';
import { EmailAlreadyRegisteredError } from '../../domain/user.errors.js';
import { FakePasswordHasher } from '../../testing/fake-password-hasher.js';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository.js';
import { RegisterUserUseCase } from './register-user.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');

describe('RegisterUserUseCase', () => {
  it('creates a regular user with a hashed password', async () => {
    const users = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(users, new FakePasswordHasher(), { now: () => NOW });

    const user = await useCase.execute({ email: 'Jane@Example.com', password: 'long enough pw' });

    expect(user.email.value).toBe('jane@example.com');
    expect(user.role).toBe(Role.User);
    expect(user.passwordHash).toBe('hashed:long enough pw');
    expect(await users.findById(user.id)).toBe(user);
  });

  it('rejects duplicate e-mail addresses regardless of case', async () => {
    const useCase = new RegisterUserUseCase(
      new InMemoryUserRepository(),
      new FakePasswordHasher(),
      {
        now: () => NOW,
      },
    );
    await useCase.execute({ email: 'jane@example.com', password: 'long enough pw' });

    await expect(
      useCase.execute({ email: 'JANE@example.com', password: 'another long pw' }),
    ).rejects.toThrow(EmailAlreadyRegisteredError);
  });

  it('enforces the password policy', async () => {
    const useCase = new RegisterUserUseCase(
      new InMemoryUserRepository(),
      new FakePasswordHasher(),
      {
        now: () => NOW,
      },
    );

    await expect(useCase.execute({ email: 'jane@example.com', password: 'short' })).rejects.toThrow(
      InvariantViolationError,
    );
  });
});
