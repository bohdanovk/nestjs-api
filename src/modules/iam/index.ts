/**
 * Public API of the Identity & Access Management bounded context.
 * Other modules may import from this file only.
 */
export type { AccessTokenClaims, TokenService } from './application/ports/token-service.js';
export { TOKEN_SERVICE } from './application/ports/token-service.js';
export { IamModule } from './iam.module.js';
export { AccessTokenGuard } from './presentation/access-token.guard.js';
