import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import type { Page, PageRequest } from '../../../../shared/domain/index.js';
import { toOffset } from '../../../../shared/domain/index.js';
import type { DateWindow } from '../../domain/catalog-lifecycle-policy.js';
import type { Game } from '../../domain/game.js';
import type { GameRepository } from '../../domain/game.repository.js';
import type { GameId } from '../../domain/game-id.js';
import type { PublisherRef } from '../../domain/publisher-ref.js';
import { toDomain, toRecord } from './game.mapper.js';
import { GameModel } from './game.schema.js';

@Injectable()
export class MongoGameRepository implements GameRepository {
  constructor(@InjectModel(GameModel.name) private readonly model: Model<GameModel>) {}

  async findById(id: GameId): Promise<Game | null> {
    const record = await this.model.findById(id.value).lean().exec();
    return record === null ? null : toDomain(record);
  }

  async findPage(request: PageRequest): Promise<Page<Game>> {
    const [records, total] = await Promise.all([
      this.model
        .find()
        .sort({ createdAt: -1, _id: 1 })
        .skip(toOffset(request))
        .limit(request.pageSize)
        .lean()
        .exec(),
      this.model.countDocuments().exec(),
    ]);
    return { items: records.map(toDomain), total, page: request.page, pageSize: request.pageSize };
  }

  async findDiscountCandidates(window: DateWindow): Promise<Game[]> {
    const records = await this.model
      .find({ releaseDate: { $gte: window.from, $lte: window.to }, discount: null })
      .sort({ releaseDate: 1 })
      .lean()
      .exec();
    return records.map(toDomain);
  }

  async save(game: Game): Promise<void> {
    await this.model.replaceOne({ _id: game.id.value }, toRecord(game), { upsert: true }).exec();
  }

  async saveAll(games: readonly Game[]): Promise<void> {
    if (games.length === 0) return;
    await this.model.bulkWrite(
      games.map((game) => ({
        replaceOne: { filter: { _id: game.id.value }, replacement: toRecord(game), upsert: true },
      })),
      { ordered: false },
    );
  }

  async delete(id: GameId): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id.value }).exec();
    return result.deletedCount > 0;
  }

  async deleteReleasedBefore(date: Date): Promise<number> {
    const result = await this.model.deleteMany({ releaseDate: { $lt: date } }).exec();
    return result.deletedCount;
  }

  async detachPublisher(publisherId: PublisherRef, now: Date): Promise<number> {
    const result = await this.model
      .updateMany(
        { publisherId: publisherId.value },
        { $set: { publisherId: null, updatedAt: now } },
      )
      .exec();
    return result.modifiedCount;
  }
}
