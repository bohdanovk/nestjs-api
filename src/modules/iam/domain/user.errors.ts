import { AuthenticationError, ConflictError, NotFoundError } from '../../../shared/domain/index.js';

export class UserNotFoundError extends NotFoundError {
  readonly code = 'USER_NOT_FOUND';

  constructor(userId: string) {
    super(`User "${userId}" was not found`, { userId });
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  readonly code = 'EMAIL_ALREADY_REGISTERED';

  constructor() {
    super('An account with this e-mail address already exists');
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid e-mail address or password');
  }
}

export class InvalidRefreshTokenError extends AuthenticationError {
  readonly code = 'INVALID_REFRESH_TOKEN';

  constructor() {
    super('The refresh token is invalid, expired or has been revoked');
  }
}

export class InvalidAccessTokenError extends AuthenticationError {
  readonly code = 'INVALID_ACCESS_TOKEN';

  constructor() {
    super('The access token is invalid or expired');
  }
}
