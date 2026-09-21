import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Page, PageRequest } from '../../../../shared/domain/index.js';
import type { Game } from '../../domain/game.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';

export type ListGamesQuery = PageRequest;

@Injectable()
export class ListGamesUseCase implements UseCase<ListGamesQuery, Page<Game>> {
  constructor(@Inject(GAME_REPOSITORY) private readonly games: GameRepository) {}

  execute(query: ListGamesQuery): Promise<Page<Game>> {
    return this.games.findPage(query);
  }
}
