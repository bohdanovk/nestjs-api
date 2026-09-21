import { InvariantViolationError, ValueObject } from '../../../../shared/domain/index.js';

export const GAME_TITLE_MAX_LENGTH = 100;

export class GameTitle extends ValueObject<string> {
  static create(raw: string): GameTitle {
    const value = raw.trim();
    if (value.length === 0) {
      throw new InvariantViolationError('Game title must not be empty', { field: 'title' });
    }
    if (value.length > GAME_TITLE_MAX_LENGTH) {
      throw new InvariantViolationError(
        `Game title must be at most ${GAME_TITLE_MAX_LENGTH} characters`,
        { field: 'title', maxLength: GAME_TITLE_MAX_LENGTH },
      );
    }
    return new GameTitle(value);
  }
}
