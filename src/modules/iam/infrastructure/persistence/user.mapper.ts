import { User } from '../../domain/user.js';
import { UserId } from '../../domain/user-id.js';
import { Email } from '../../domain/value-objects/email.js';
import type { UserModel } from './user.schema.js';

export type UserRecord = Pick<
  UserModel,
  '_id' | 'email' | 'passwordHash' | 'role' | 'refreshTokenId' | 'createdAt' | 'updatedAt'
>;

export function toDomain(record: UserRecord): User {
  return User.reconstitute(UserId.create(record._id), {
    email: Email.create(record.email),
    passwordHash: record.passwordHash,
    role: record.role,
    refreshTokenId: record.refreshTokenId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toRecord(user: User): UserRecord {
  return {
    _id: user.id.value,
    email: user.email.value,
    passwordHash: user.passwordHash,
    role: user.role,
    refreshTokenId: user.refreshTokenId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
