import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import type { PublisherLookup } from '../../../publishers/index.js';
import { PUBLISHER_LOOKUP } from '../../../publishers/index.js';
import type { GameDetails } from '../../domain/game.js';
import { Game } from '../../domain/game.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';
import { assertPublisherExists } from '../publisher-existence.js';

export type CreateGameCommand = GameDetails;

@Injectable()
export class CreateGameUseCase implements UseCase<CreateGameCommand, Game> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(PUBLISHER_LOOKUP) private readonly publishers: PublisherLookup,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: CreateGameCommand): Promise<Game> {
    await assertPublisherExists(this.publishers, command.publisherId);

    const game = Game.create(command, this.clock.now());
    await this.games.save(game);
    return game;
  }
}
