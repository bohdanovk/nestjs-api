import { EntityId } from '../../../shared/domain/index.js';

/**
 * Reference to a publisher living in the Publishers context. Aggregates reference
 * other aggregates by identity only, never by object.
 */
export class PublisherRef extends EntityId {
  static create(value: string): PublisherRef {
    return new PublisherRef(value);
  }
}
