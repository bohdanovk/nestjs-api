import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import { GameNotFoundError } from '../../domain/game.errors.js';
import type { Game } from '../../domain/game.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';
import { GameId } from '../../domain/game-id.js';

export interface GetGameQuery {
  readonly gameId: string;
}

@Injectable()
export class GetGameUseCase implements UseCase<GetGameQuery, Game> {
  constructor(@Inject(GAME_REPOSITORY) private readonly games: GameRepository) {}

  async execute(query: GetGameQuery): Promise<Game> {
    const game = await this.games.findById(GameId.create(query.gameId));
    if (game === null) {
      throw new GameNotFoundError(query.gameId);
    }
    return game;
  }
}
