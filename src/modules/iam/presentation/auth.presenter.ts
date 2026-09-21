import type { User } from '../domain/user.js';
import type { UserResponse } from './auth.schemas.js';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id.value,
    email: user.email.value,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
