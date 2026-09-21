import type { DomainEvent } from '../domain/index.js';

/** Port used by use cases to publish domain events after a successful write. */
export interface EventPublisher {
  publishAll(events: readonly DomainEvent[]): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('EventPublisher');
