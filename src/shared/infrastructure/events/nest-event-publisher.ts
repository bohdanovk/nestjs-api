import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { EventPublisher } from '../../application/index.js';
import type { DomainEvent } from '../../domain/index.js';

/** In-process event publisher backed by @nestjs/event-emitter. */
@Injectable()
export class NestEventPublisher implements EventPublisher {
  constructor(private readonly emitter: EventEmitter2) {}

  async publishAll(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.emitter.emitAsync(event.eventName, event);
    }
  }
}
