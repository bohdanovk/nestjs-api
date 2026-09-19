import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Role } from '../../domain/index.js';
import type { AuthenticatedRequest } from './authenticated-user.js';
import { ROLES_KEY } from './roles.decorator.js';

/** Enforces `@Roles()`. Must run after the guard that authenticates the request. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<readonly Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (required === undefined || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (user === undefined) {
      throw new UnauthorizedException('Authentication required.');
    }
    if (!required.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions.');
    }
    return true;
  }
}
