import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import { InvalidRefreshTokenError } from '../../domain/user.errors.js';
import type { UserRepository } from '../../domain/user.repository.js';
import { USER_REPOSITORY } from '../../domain/user.repository.js';
import { UserId } from '../../domain/user-id.js';
import type { AuthTokens } from '../auth-tokens.js';
import { toAuthTokens } from '../auth-tokens.js';
import type { TokenService } from '../ports/token-service.js';
import { TOKEN_SERVICE } from '../ports/token-service.js';

export interface RefreshTokensCommand {
  readonly refreshToken: string;
}

/** Refresh-token rotation: every refresh invalidates the previous token. */
@Injectable()
export class RefreshTokensUseCase implements UseCase<RefreshTokensCommand, AuthTokens> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<AuthTokens> {
    const claims = await this.tokens.verifyRefreshToken(command.refreshToken);

    const user = await this.users.findById(UserId.create(claims.sub));
    if (!user?.hasActiveSession(claims.jti)) {
      throw new InvalidRefreshTokenError();
    }

    const refreshTokenId = randomUUID();
    user.startSession(refreshTokenId, this.clock.now());
    await this.users.save(user);

    return toAuthTokens(
      await this.tokens.issue({ sub: user.id.value, role: user.role }, refreshTokenId),
    );
  }
}
