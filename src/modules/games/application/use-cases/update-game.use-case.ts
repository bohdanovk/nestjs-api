import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import type { PublisherLookup } from '../../../publishers/index.js';
import { PUBLISHER_LOOKUP } from '../../../publishers/index.js';
import { GameNotFoundError } from '../../domain/game.errors.js';
import type { Game, GameDetails } from '../../domain/game.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';
import { GameId } from '../../domain/game-id.js';
import { assertPublisherExists } from '../publisher-existence.js';

export interface UpdateGameCommand extends GameDetails {
  readonly gameId: string;
}

@Injectable()
export class UpdateGameUseCase implements UseCase<UpdateGameCommand, Game> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(PUBLISHER_LOOKUP) private readonly publishers: PublisherLookup,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: UpdateGameCommand): Promise<Game> {
    const game = await this.games.findById(GameId.create(command.gameId));
    if (game === null) {
      throw new GameNotFoundError(command.gameId);
    }
    await assertPublisherExists(this.publishers, command.publisherId);

    game.update(command, this.clock.now());
    await this.games.save(game);
    return game;
  }
}
