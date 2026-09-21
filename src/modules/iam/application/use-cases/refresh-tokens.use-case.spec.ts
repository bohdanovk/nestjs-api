import { describe, expect, it } from 'vitest';

import { Role } from '../../../../shared/domain/index.js';
import { InvalidRefreshTokenError } from '../../domain/user.errors.js';
import { User } from '../../domain/user.js';
import { FakeTokenService } from '../../testing/fake-token.service.js';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository.js';
import { RefreshTokensUseCase } from './refresh-tokens.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');

describe('RefreshTokensUseCase', () => {
  it('rotates the refresh token so the previous one stops working', async () => {
    const user = User.create({ email: 'a@b.co', passwordHash: 'h', role: Role.User }, NOW);
    user.startSession('session-1', NOW);
    const tokens = new FakeTokenService();
    const useCase = new RefreshTokensUseCase(new InMemoryUserRepository().seed(user), tokens, {
      now: () => NOW,
    });
    const first = await tokens.issue({ sub: user.id.value, role: user.role }, 'session-1');

    const rotated = await useCase.execute({ refreshToken: first.refreshToken });

    expect(user.refreshTokenId).not.toBe('session-1');
    expect(rotated.refreshToken).toContain(user.refreshTokenId);
    await expect(useCase.execute({ refreshToken: first.refreshToken })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });

  it('rejects tokens after logout and tokens for unknown users', async () => {
    const user = User.create({ email: 'a@b.co', passwordHash: 'h', role: Role.User }, NOW);
    const tokens = new FakeTokenService();
    const useCase = new RefreshTokensUseCase(new InMemoryUserRepository().seed(user), tokens, {
      now: () => NOW,
    });
    const loggedOut = await tokens.issue({ sub: user.id.value, role: user.role }, 'stale');
    const ghost = await tokens.issue(
      { sub: '9e0f2f4c-2a5d-4c0b-8f0a-6b9c1d2e3f40', role: Role.User },
      'x',
    );

    await expect(useCase.execute({ refreshToken: loggedOut.refreshToken })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
    await expect(useCase.execute({ refreshToken: ghost.refreshToken })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
    await expect(useCase.execute({ refreshToken: 'garbage' })).rejects.toThrow(
      InvalidRefreshTokenError,
    );
  });
});
