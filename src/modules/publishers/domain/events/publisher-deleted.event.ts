import { DomainEvent } from '../../../../shared/domain/index.js';

export class PublisherDeletedEvent extends DomainEvent {
  static readonly EVENT_NAME = 'publisher.deleted';

  readonly eventName = PublisherDeletedEvent.EVENT_NAME;

  constructor(
    readonly publisherId: string,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
