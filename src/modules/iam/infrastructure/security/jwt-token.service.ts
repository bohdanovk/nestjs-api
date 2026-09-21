import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppConfig, durationToSeconds } from '../../../../config/index.js';
import { isRole } from '../../../../shared/domain/index.js';
import type {
  AccessTokenClaims,
  IssuedTokens,
  RefreshTokenClaims,
  TokenService,
} from '../../application/ports/token-service.js';
import { InvalidAccessTokenError, InvalidRefreshTokenError } from '../../domain/user.errors.js';

const ACCESS_AUDIENCE = 'access';
const REFRESH_AUDIENCE = 'refresh';
const ISSUER = 'games-catalog-api';

/** HS256 JWTs with separate secrets and audiences for access and refresh tokens. */
@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
  ) {}

  async issue(claims: AccessTokenClaims, refreshTokenId: string): Promise<IssuedTokens> {
    const { auth } = this.config;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { role: claims.role },
        {
          subject: claims.sub,
          secret: auth.accessTokenSecret,
          expiresIn: auth.accessTokenTtl,
          audience: ACCESS_AUDIENCE,
          issuer: ISSUER,
        },
      ),
      this.jwt.signAsync(
        {},
        {
          subject: claims.sub,
          jwtid: refreshTokenId,
          secret: auth.refreshTokenSecret,
          expiresIn: auth.refreshTokenTtl,
          audience: REFRESH_AUDIENCE,
          issuer: ISSUER,
        },
      ),
    ]);
    return { accessToken, refreshToken, expiresIn: durationToSeconds(auth.accessTokenTtl) };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    let payload: { sub?: unknown; role?: unknown };
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.auth.accessTokenSecret,
        audience: ACCESS_AUDIENCE,
        issuer: ISSUER,
      });
    } catch {
      throw new InvalidAccessTokenError();
    }
    if (typeof payload.sub !== 'string' || !isRole(payload.role)) {
      throw new InvalidAccessTokenError();
    }
    return { sub: payload.sub, role: payload.role };
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
    let payload: { sub?: unknown; jti?: unknown };
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.auth.refreshTokenSecret,
        audience: REFRESH_AUDIENCE,
        issuer: ISSUER,
      });
    } catch {
      throw new InvalidRefreshTokenError();
    }
    if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string') {
      throw new InvalidRefreshTokenError();
    }
    return { sub: payload.sub, jti: payload.jti };
  }
}
