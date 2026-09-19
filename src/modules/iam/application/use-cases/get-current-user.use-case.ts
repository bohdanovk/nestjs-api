import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import { UserNotFoundError } from '../../domain/user.errors.js';
import type { User } from '../../domain/user.js';
import type { UserRepository } from '../../domain/user.repository.js';
import { USER_REPOSITORY } from '../../domain/user.repository.js';
import { UserId } from '../../domain/user-id.js';

export interface GetCurrentUserQuery {
  readonly userId: string;
}

@Injectable()
export class GetCurrentUserUseCase implements UseCase<GetCurrentUserQuery, User> {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(query: GetCurrentUserQuery): Promise<User> {
    const user = await this.users.findById(UserId.create(query.userId));
    if (user === null) {
      throw new UserNotFoundError(query.userId);
    }
    return user;
  }
}
