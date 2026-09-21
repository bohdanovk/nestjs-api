import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PublisherDeletedEvent } from '../../../publishers/index.js';
import { DetachPublisherFromGamesUseCase } from '../../application/use-cases/detach-publisher-from-games.use-case.js';

/** Adapter between the in-process event bus and the application layer. */
@Injectable()
export class PublisherDeletedListener {
  private readonly logger = new Logger(PublisherDeletedListener.name);

  constructor(private readonly detachPublisher: DetachPublisherFromGamesUseCase) {}

  @OnEvent(PublisherDeletedEvent.EVENT_NAME, { promisify: true })
  async handle(event: PublisherDeletedEvent): Promise<void> {
    const detached = await this.detachPublisher.execute({ publisherId: event.publisherId });
    this.logger.log({ publisherId: event.publisherId, detached }, 'Detached publisher from games');
  }
}
