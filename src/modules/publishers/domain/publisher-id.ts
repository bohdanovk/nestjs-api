import { EntityId } from '../../../shared/domain/index.js';

export class PublisherId extends EntityId {
  static create(value: string): PublisherId {
    return new PublisherId(value);
  }

  static generate(): PublisherId {
    return new PublisherId(EntityId.newValue());
  }
}
