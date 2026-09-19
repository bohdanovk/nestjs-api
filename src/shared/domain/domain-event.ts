/**
 * Something that happened in the domain that other parts of the system may react to.
 * Events are recorded on the aggregate and published by the application layer after
 * the aggregate has been persisted.
 */
export abstract class DomainEvent {
  /** Dotted event name used for routing, e.g. `publisher.deleted`. */
  abstract readonly eventName: string;

  readonly occurredAt: Date;

  protected constructor(occurredAt: Date) {
    this.occurredAt = occurredAt;
  }
}
