import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../../../shared/presentation/index.js';
import { IS_PUBLIC_KEY } from '../../../shared/presentation/index.js';
import type { TokenService } from '../application/ports/token-service.js';
import { TOKEN_SERVICE } from '../application/ports/token-service.js';

const BEARER_PREFIX = /^Bearer\s+(?<token>\S+)$/i;

/**
 * Global guard: every route requires a valid access token unless marked `@Public()`.
 * Verification is stateless (no database round-trip); revocation applies to refresh tokens.
 */
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = BEARER_PREFIX.exec(request.headers.authorization ?? '')?.groups?.token;
    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const claims = await this.tokens.verifyAccessToken(token);
    request.user = { id: claims.sub, role: claims.role };
    return true;
  }
}
