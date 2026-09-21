import { SetMetadata } from '@nestjs/common';

import type { Role } from '../../domain/index.js';

export const ROLES_KEY = 'roles';

/** Restricts a handler (or controller) to callers holding one of the given roles. */
export const Roles = (...roles: readonly Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
