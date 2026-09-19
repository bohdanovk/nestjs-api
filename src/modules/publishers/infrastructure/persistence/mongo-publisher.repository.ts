import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, QueryFilter } from 'mongoose';

import type { Page, PageRequest } from '../../../../shared/domain/index.js';
import { toOffset } from '../../../../shared/domain/index.js';
import { isDuplicateKeyError } from '../../../../shared/infrastructure/index.js';
import { SiretAlreadyRegisteredError } from '../../domain/publisher.errors.js';
import type { Publisher } from '../../domain/publisher.js';
import type { PublisherRepository } from '../../domain/publisher.repository.js';
import type { PublisherId } from '../../domain/publisher-id.js';
import type { Siret } from '../../domain/value-objects/siret.js';
import { toDomain, toRecord } from './publisher.mapper.js';
import { PublisherModel } from './publisher.schema.js';

@Injectable()
export class MongoPublisherRepository implements PublisherRepository {
  constructor(@InjectModel(PublisherModel.name) private readonly model: Model<PublisherModel>) {}

  async findById(id: PublisherId): Promise<Publisher | null> {
    const record = await this.model.findById(id.value).lean().exec();
    return record === null ? null : toDomain(record);
  }

  async findPage(request: PageRequest): Promise<Page<Publisher>> {
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

  async existsWithSiret(siret: Siret, excluding?: PublisherId): Promise<boolean> {
    const filter: QueryFilter<PublisherModel> = { siret: siret.value };
    if (excluding !== undefined) {
      filter._id = { $ne: excluding.value };
    }
    return (await this.model.exists(filter).exec()) !== null;
  }

  async save(publisher: Publisher): Promise<void> {
    try {
      await this.model
        .replaceOne({ _id: publisher.id.value }, toRecord(publisher), { upsert: true })
        .exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new SiretAlreadyRegisteredError(publisher.siret.value);
      }
      throw error;
    }
  }

  async delete(id: PublisherId): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id.value }).exec();
    return result.deletedCount > 0;
  }
}
