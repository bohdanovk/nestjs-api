import type {
  AccessTokenClaims,
  IssuedTokens,
  RefreshTokenClaims,
  TokenService,
} from '../application/ports/token-service.js';
import { InvalidAccessTokenError, InvalidRefreshTokenError } from '../domain/user.errors.js';

/** Encodes claims as plain JSON so tests can inspect and forge tokens. */
export class FakeTokenService implements TokenService {
  issue(claims: AccessTokenClaims, refreshTokenId: string): Promise<IssuedTokens> {
    return Promise.resolve({
      accessToken: `access:${JSON.stringify(claims)}`,
      refreshToken: `refresh:${JSON.stringify({ sub: claims.sub, jti: refreshTokenId })}`,
      expiresIn: 900,
    });
  }

  verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    if (!token.startsWith('access:')) return Promise.reject(new InvalidAccessTokenError());
    return Promise.resolve(JSON.parse(token.slice('access:'.length)) as AccessTokenClaims);
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
    if (!token.startsWith('refresh:')) return Promise.reject(new InvalidRefreshTokenError());
    return Promise.resolve(JSON.parse(token.slice('refresh:'.length)) as RefreshTokenClaims);
  }
}
