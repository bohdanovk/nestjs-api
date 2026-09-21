import type { Request } from 'express';

import type { Role } from '../../domain/index.js';

/** Identity attached to the request once the access token has been verified. */
export interface AuthenticatedUser {
  readonly id: string;
  readonly role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
