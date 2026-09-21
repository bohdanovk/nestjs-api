import type { User } from './user.js';
import type { UserId } from './user-id.js';
import type { Email } from './value-objects/email.js';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  /** Inserts or fully replaces the aggregate. */
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
