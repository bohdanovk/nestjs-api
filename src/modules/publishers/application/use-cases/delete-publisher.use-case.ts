import { Inject, Injectable } from '@nestjs/common';

import type { EventPublisher, UseCase } from '../../../../shared/application/index.js';
import { EVENT_PUBLISHER } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import { PublisherNotFoundError } from '../../domain/publisher.errors.js';
import type { PublisherRepository } from '../../domain/publisher.repository.js';
import { PUBLISHER_REPOSITORY } from '../../domain/publisher.repository.js';
import { PublisherId } from '../../domain/publisher-id.js';

export interface DeletePublisherCommand {
  readonly publisherId: string;
}

@Injectable()
export class DeletePublisherUseCase implements UseCase<DeletePublisherCommand, void> {
  constructor(
    @Inject(PUBLISHER_REPOSITORY) private readonly publishers: PublisherRepository,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisher,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: DeletePublisherCommand): Promise<void> {
    const id = PublisherId.create(command.publisherId);
    const publisher = await this.publishers.findById(id);
    if (publisher === null) {
      throw new PublisherNotFoundError(command.publisherId);
    }

    publisher.markDeleted(this.clock.now());
    await this.publishers.delete(id);
    await this.events.publishAll(publisher.pullEvents());
  }
}
