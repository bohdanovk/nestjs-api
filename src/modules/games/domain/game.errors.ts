import { ConflictError, NotFoundError } from '../../../shared/domain/index.js';

export class GameNotFoundError extends NotFoundError {
  readonly code = 'GAME_NOT_FOUND';

  constructor(gameId: string) {
    super(`Game "${gameId}" was not found`, { gameId });
  }
}

export class GameHasNoPublisherError extends NotFoundError {
  readonly code = 'GAME_HAS_NO_PUBLISHER';

  constructor(gameId: string) {
    super(`Game "${gameId}" has no publisher`, { gameId });
  }
}

export class GameAlreadyDiscountedError extends ConflictError {
  readonly code = 'GAME_ALREADY_DISCOUNTED';

  constructor(gameId: string) {
    super(`Game "${gameId}" already has a discount applied`, { gameId });
  }
}
