import type { Role } from '../../../shared/domain/index.js';
import { AggregateRoot } from '../../../shared/domain/index.js';
import { UserId } from './user-id.js';
import { Email } from './value-objects/email.js';

export interface UserProps {
  readonly email: Email;
  readonly passwordHash: string;
  readonly role: Role;
  /** Identifier (`jti`) of the currently valid refresh token, or null when logged out. */
  readonly refreshTokenId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface NewUser {
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;
}

export class User extends AggregateRoot<UserId> {
  private props: UserProps;

  private constructor(id: UserId, props: UserProps) {
    super(id);
    this.props = props;
  }

  static create(input: NewUser, now: Date): User {
    return new User(UserId.generate(), {
      email: Email.create(input.email),
      passwordHash: input.passwordHash,
      role: input.role,
      refreshTokenId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Rebuilds an aggregate from persisted state. Performs no validation. */
  static reconstitute(id: UserId, props: UserProps): User {
    return new User(id, props);
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): Role {
    return this.props.role;
  }

  get refreshTokenId(): string | null {
    return this.props.refreshTokenId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /** Starts (or rotates) the single active session; previous refresh tokens become invalid. */
  startSession(refreshTokenId: string, now: Date): void {
    this.props = { ...this.props, refreshTokenId, updatedAt: now };
  }

  endSession(now: Date): void {
    this.props = { ...this.props, refreshTokenId: null, updatedAt: now };
  }

  hasActiveSession(refreshTokenId: string): boolean {
    return this.props.refreshTokenId !== null && this.props.refreshTokenId === refreshTokenId;
  }
}
