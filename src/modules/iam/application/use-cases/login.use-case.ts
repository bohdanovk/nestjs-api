import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import { InvalidCredentialsError } from '../../domain/user.errors.js';
import type { UserRepository } from '../../domain/user.repository.js';
import { USER_REPOSITORY } from '../../domain/user.repository.js';
import { Email } from '../../domain/value-objects/email.js';
import type { AuthTokens } from '../auth-tokens.js';
import { toAuthTokens } from '../auth-tokens.js';
import type { PasswordHasher } from '../ports/password-hasher.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.js';
import type { TokenService } from '../ports/token-service.js';
import { TOKEN_SERVICE } from '../ports/token-service.js';

export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}

@Injectable()
export class LoginUseCase implements UseCase<LoginCommand, AuthTokens> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokens> {
    let email: Email;
    try {
      email = Email.create(command.email);
    } catch {
      throw new InvalidCredentialsError();
    }

    const user = await this.users.findByEmail(email);
    // Verify against a dummy hash when the user is unknown so response timing does not
    // reveal whether the e-mail address is registered.
    const passwordHash = user?.passwordHash ?? (await this.hasher.hash(command.password));
    const valid = await this.hasher.verify(passwordHash, command.password);
    if (user === null || !valid) {
      throw new InvalidCredentialsError();
    }

    const refreshTokenId = randomUUID();
    user.startSession(refreshTokenId, this.clock.now());
    await this.users.save(user);

    return toAuthTokens(
      await this.tokens.issue({ sub: user.id.value, role: user.role }, refreshTokenId),
    );
  }
}
