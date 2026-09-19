import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { PublisherLookup, PublisherSummary } from '../../../publishers/index.js';
import { PUBLISHER_LOOKUP, PublisherNotFoundError } from '../../../publishers/index.js';
import { GameHasNoPublisherError, GameNotFoundError } from '../../domain/game.errors.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';
import { GameId } from '../../domain/game-id.js';

export interface GetGamePublisherQuery {
  readonly gameId: string;
}

@Injectable()
export class GetGamePublisherUseCase implements UseCase<GetGamePublisherQuery, PublisherSummary> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(PUBLISHER_LOOKUP) private readonly publishers: PublisherLookup,
  ) {}

  async execute(query: GetGamePublisherQuery): Promise<PublisherSummary> {
    const game = await this.games.findById(GameId.create(query.gameId));
    if (game === null) {
      throw new GameNotFoundError(query.gameId);
    }
    if (game.publisherId === null) {
      throw new GameHasNoPublisherError(query.gameId);
    }

    const publisher = await this.publishers.findById(game.publisherId.value);
    if (publisher === null) {
      throw new PublisherNotFoundError(game.publisherId.value);
    }
    return publisher;
  }
}
