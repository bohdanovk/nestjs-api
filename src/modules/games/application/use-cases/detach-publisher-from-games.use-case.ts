import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import type { GameRepository } from '../../domain/game.repository.js';
import { GAME_REPOSITORY } from '../../domain/game.repository.js';
import { PublisherRef } from '../../domain/publisher-ref.js';

export interface DetachPublisherCommand {
  readonly publisherId: string;
}

/** Reaction to a publisher being deleted: its games stay in the catalog without a publisher. */
@Injectable()
export class DetachPublisherFromGamesUseCase implements UseCase<DetachPublisherCommand, number> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly games: GameRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  execute(command: DetachPublisherCommand): Promise<number> {
    return this.games.detachPublisher(PublisherRef.create(command.publisherId), this.clock.now());
  }
}
