import type { IssuedTokens } from './ports/token-service.js';

export interface AuthTokens extends IssuedTokens {
  readonly tokenType: 'Bearer';
}

export function toAuthTokens(issued: IssuedTokens): AuthTokens {
  return { ...issued, tokenType: 'Bearer' };
}
