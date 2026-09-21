import type { Role } from '../../../../shared/domain/index.js';

export interface AccessTokenClaims {
  readonly sub: string;
  readonly role: Role;
}

export interface RefreshTokenClaims {
  readonly sub: string;
  /** Unique token id, matched against the session stored on the user. */
  readonly jti: string;
}

export interface IssuedTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  /** Access token lifetime in seconds. */
  readonly expiresIn: number;
}

export interface TokenService {
  issue(claims: AccessTokenClaims, refreshTokenId: string): Promise<IssuedTokens>;
  /** Resolves the claims of a valid access token; rejects with InvalidAccessTokenError otherwise. */
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  /** Resolves the claims of a valid refresh token; rejects with InvalidRefreshTokenError otherwise. */
  verifyRefreshToken(token: string): Promise<RefreshTokenClaims>;
}

export const TOKEN_SERVICE = Symbol('TokenService');
