import type { DomainEvent } from './domain-event.js';
import type { EntityId } from './entity-id.js';

/** An object defined by its identity rather than its attributes. */
export abstract class Entity<Id extends EntityId> {
  protected constructor(readonly id: Id) {}

  equals(other: Entity<Id> | null | undefined): boolean {
    return other?.constructor === this.constructor && this.id.equals(other.id);
  }
}

/**
 * Consistency boundary: the only entity type repositories load and persist.
 * Aggregates record domain events; the application layer publishes them once
 * the transaction has succeeded.
 */
export abstract class AggregateRoot<Id extends EntityId> extends Entity<Id> {
  private readonly pendingEvents: DomainEvent[] = [];

  protected recordEvent(event: DomainEvent): void {
    this.pendingEvents.push(event);
  }

  /** Returns recorded events and clears the buffer. */
  pullEvents(): DomainEvent[] {
    return this.pendingEvents.splice(0, this.pendingEvents.length);
  }
}
