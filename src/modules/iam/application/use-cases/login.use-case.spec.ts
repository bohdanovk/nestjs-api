import { beforeEach, describe, expect, it } from 'vitest';

import { Role } from '../../../../shared/domain/index.js';
import { InvalidCredentialsError } from '../../domain/user.errors.js';
import { User } from '../../domain/user.js';
import { FakePasswordHasher } from '../../testing/fake-password-hasher.js';
import { FakeTokenService } from '../../testing/fake-token.service.js';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository.js';
import { LoginUseCase } from './login.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const PASSWORD = 'correct horse battery staple';

describe('LoginUseCase', () => {
  let users: InMemoryUserRepository;
  let user: User;
  let useCase: LoginUseCase;

  beforeEach(() => {
    user = User.create(
      { email: 'Jane@Example.com', passwordHash: `hashed:${PASSWORD}`, role: Role.User },
      NOW,
    );
    users = new InMemoryUserRepository().seed(user);
    useCase = new LoginUseCase(users, new FakePasswordHasher(), new FakeTokenService(), {
      now: () => NOW,
    });
  });

  it('issues tokens and starts a session for valid credentials', async () => {
    const tokens = await useCase.execute({ email: 'jane@example.com', password: PASSWORD });

    expect(tokens.tokenType).toBe('Bearer');
    expect(tokens.accessToken).toContain(user.id.value);
    expect(user.refreshTokenId).not.toBeNull();
    expect(tokens.refreshToken).toContain(user.refreshTokenId);
  });

  it('rejects a wrong password', async () => {
    await expect(useCase.execute({ email: 'jane@example.com', password: 'nope' })).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(user.refreshTokenId).toBeNull();
  });

  it('rejects unknown or malformed e-mail addresses with the same error', async () => {
    await expect(
      useCase.execute({ email: 'ghost@example.com', password: PASSWORD }),
    ).rejects.toThrow(InvalidCredentialsError);
    await expect(useCase.execute({ email: 'not-an-email', password: PASSWORD })).rejects.toThrow(
      InvalidCredentialsError,
    );
  });
});
