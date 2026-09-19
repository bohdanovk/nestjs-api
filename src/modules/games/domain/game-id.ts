import { EntityId } from '../../../shared/domain/index.js';

export class GameId extends EntityId {
  static create(value: string): GameId {
    return new GameId(value);
  }

  static generate(): GameId {
    return new GameId(EntityId.newValue());
  }
}
