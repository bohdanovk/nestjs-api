import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import { GameNotFoundError } from '../../domain/game.errors.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';
import { GameId } from '../../domain/game-id.js';

export interface DeleteGameCommand {
  readonly gameId: string;
}

@Injectable()
export class DeleteGameUseCase implements UseCase<DeleteGameCommand, void> {
  constructor(@Inject(GAME_REPOSITORY) private readonly games: GameRepository) {}

  async execute(command: DeleteGameCommand): Promise<void> {
    const deleted = await this.games.delete(GameId.create(command.gameId));
    if (!deleted) {
      throw new GameNotFoundError(command.gameId);
    }
  }
}
