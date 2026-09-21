/**
 * Root of the domain error hierarchy.
 *
 * Domain and application code throw these instead of HTTP exceptions; the presentation
 * layer maps each abstract category to a status code (see ProblemDetailsFilter).
 */
export abstract class DomainError extends Error {
  /** Stable, machine-readable identifier such as `GAME_NOT_FOUND`. */
  abstract readonly code: string;

  constructor(
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** The requested resource does not exist. */
export abstract class NotFoundError extends DomainError {}

/** The request conflicts with the current state (duplicate, stale version, ...). */
export abstract class ConflictError extends DomainError {}

/** The caller could not be authenticated. */
export abstract class AuthenticationError extends DomainError {}

/** The caller is authenticated but not allowed to perform the action. */
export abstract class AuthorizationError extends DomainError {}

/** A business rule or value-object invariant was violated. */
export class InvariantViolationError extends DomainError {
  readonly code = 'INVARIANT_VIOLATION';
}
