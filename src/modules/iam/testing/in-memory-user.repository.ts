import type { User } from '../domain/user.js';
import type { UserRepository } from '../domain/user.repository.js';
import type { UserId } from '../domain/user-id.js';
import type { Email } from '../domain/value-objects/email.js';

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  seed(...users: readonly User[]): this {
    for (const user of users) this.store.set(user.id.value, user);
    return this;
  }

  findById(id: UserId): Promise<User | null> {
    return Promise.resolve(this.store.get(id.value) ?? null);
  }

  findByEmail(email: Email): Promise<User | null> {
    return Promise.resolve(
      [...this.store.values()].find((user) => user.email.equals(email)) ?? null,
    );
  }

  save(user: User): Promise<void> {
    this.store.set(user.id.value, user);
    return Promise.resolve();
  }
}
