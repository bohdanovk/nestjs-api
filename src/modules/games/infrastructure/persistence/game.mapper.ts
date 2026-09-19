import { Game } from '../../domain/game.js';
import { GameId } from '../../domain/game-id.js';
import { PublisherRef } from '../../domain/publisher-ref.js';
import { Discount } from '../../domain/value-objects/discount.js';
import { GameTitle } from '../../domain/value-objects/game-title.js';
import { Price } from '../../domain/value-objects/price.js';
import { Tags } from '../../domain/value-objects/tags.js';
import type { GameModel } from './game.schema.js';

export type GameRecord = Pick<
  GameModel,
  | '_id'
  | 'title'
  | 'priceCents'
  | 'tags'
  | 'releaseDate'
  | 'publisherId'
  | 'discount'
  | 'createdAt'
  | 'updatedAt'
>;

export function toDomain(record: GameRecord): Game {
  return Game.reconstitute(GameId.create(record._id), {
    title: GameTitle.create(record.title),
    price: Price.fromCents(record.priceCents),
    tags: Tags.create(record.tags),
    releaseDate: record.releaseDate,
    publisherId: record.publisherId === null ? null : PublisherRef.create(record.publisherId),
    discount:
      record.discount === null
        ? null
        : Discount.create(record.discount.percentage, record.discount.appliedAt),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toRecord(game: Game): GameRecord {
  return {
    _id: game.id.value,
    title: game.title.value,
    priceCents: game.price.cents,
    tags: [...game.tags.value],
    releaseDate: game.releaseDate,
    publisherId: game.publisherId?.value ?? null,
    discount:
      game.discount === null
        ? null
        : { percentage: game.discount.percentage, appliedAt: game.discount.appliedAt },
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}
