import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK, Role } from '../../../../shared/domain/index.js';
import { User } from '../../domain/user.js';
import type { UserRepository } from '../../domain/user.repository.js';
import { USER_REPOSITORY } from '../../domain/user.repository.js';
import { Email } from '../../domain/value-objects/email.js';
import { Password } from '../../domain/value-objects/password.js';
import type { PasswordHasher } from '../ports/password-hasher.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.js';

export interface EnsureAdminUserCommand {
  readonly email: string;
  readonly password: string;
}

/** Idempotent: creates the admin account only when no user with that e-mail exists. */
@Injectable()
export class EnsureAdminUserUseCase implements UseCase<EnsureAdminUserCommand, boolean> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: EnsureAdminUserCommand): Promise<boolean> {
    const email = Email.create(command.email);
    if ((await this.users.findByEmail(email)) !== null) return false;

    const password = Password.create(command.password);
    const admin = User.create(
      {
        email: email.value,
        passwordHash: await this.hasher.hash(password.value),
        role: Role.Admin,
      },
      this.clock.now(),
    );
    await this.users.save(admin);
    return true;
  }
}
