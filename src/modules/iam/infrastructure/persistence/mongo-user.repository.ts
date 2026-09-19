import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { isDuplicateKeyError } from '../../../../shared/infrastructure/index.js';
import { EmailAlreadyRegisteredError } from '../../domain/user.errors.js';
import type { User } from '../../domain/user.js';
import type { UserRepository } from '../../domain/user.repository.js';
import type { UserId } from '../../domain/user-id.js';
import type { Email } from '../../domain/value-objects/email.js';
import { toDomain, toRecord } from './user.mapper.js';
import { UserModel } from './user.schema.js';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(@InjectModel(UserModel.name) private readonly model: Model<UserModel>) {}

  async findById(id: UserId): Promise<User | null> {
    const record = await this.model.findById(id.value).lean().exec();
    return record === null ? null : toDomain(record);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.model.findOne({ email: email.value }).lean().exec();
    return record === null ? null : toDomain(record);
  }

  async save(user: User): Promise<void> {
    try {
      await this.model.replaceOne({ _id: user.id.value }, toRecord(user), { upsert: true }).exec();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
  }
}
