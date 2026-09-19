import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator, UnauthorizedException } from '@nestjs/common';

import type { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user.js';

/** Injects the authenticated caller. Throws if used on a route that did not authenticate. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (user === undefined) {
      throw new UnauthorizedException('Authentication required.');
    }
    return user;
  },
);
