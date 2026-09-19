import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK, Role } from '../../../../shared/domain/index.js';
import { EmailAlreadyRegisteredError } from '../../domain/user.errors.js';
import { User } from '../../domain/user.js';
import type { UserRepository } from '../../domain/user.repository.js';
import { USER_REPOSITORY } from '../../domain/user.repository.js';
import { Email } from '../../domain/value-objects/email.js';
import { Password } from '../../domain/value-objects/password.js';
import type { PasswordHasher } from '../ports/password-hasher.js';
import { PASSWORD_HASHER } from '../ports/password-hasher.js';

export interface RegisterUserCommand {
  readonly email: string;
  readonly password: string;
}

@Injectable()
export class RegisterUserUseCase implements UseCase<RegisterUserCommand, User> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const email = Email.create(command.email);
    const password = Password.create(command.password);

    if ((await this.users.findByEmail(email)) !== null) {
      throw new EmailAlreadyRegisteredError();
    }

    const user = User.create(
      { email: email.value, passwordHash: await this.hasher.hash(password.value), role: Role.User },
      this.clock.now(),
    );
    await this.users.save(user);
    return user;
  }
}
