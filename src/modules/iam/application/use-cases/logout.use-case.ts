import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import type { UserRepository } from '../../domain/user.repository.js';
import { USER_REPOSITORY } from '../../domain/user.repository.js';
import { UserId } from '../../domain/user-id.js';

export interface LogoutCommand {
  readonly userId: string;
}

/** Revokes the active refresh token. Access tokens stay valid until they expire. */
@Injectable()
export class LogoutUseCase implements UseCase<LogoutCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const user = await this.users.findById(UserId.create(command.userId));
    if (user === null) return;

    user.endSession(this.clock.now());
    await this.users.save(user);
  }
}
