import { Publisher } from '../../domain/publisher.js';
import { PublisherId } from '../../domain/publisher-id.js';
import { PhoneNumber } from '../../domain/value-objects/phone-number.js';
import { PublisherName } from '../../domain/value-objects/publisher-name.js';
import { Siret } from '../../domain/value-objects/siret.js';
import type { PublisherModel } from './publisher.schema.js';

export type PublisherRecord = Pick<
  PublisherModel,
  '_id' | 'name' | 'siret' | 'phone' | 'createdAt' | 'updatedAt'
>;

export function toDomain(record: PublisherRecord): Publisher {
  return Publisher.reconstitute(PublisherId.create(record._id), {
    name: PublisherName.create(record.name),
    siret: Siret.create(record.siret),
    phone: PhoneNumber.create(record.phone),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toRecord(publisher: Publisher): PublisherRecord {
  return {
    _id: publisher.id.value,
    name: publisher.name.value,
    siret: publisher.siret.value,
    phone: publisher.phone.value,
    createdAt: publisher.createdAt,
    updatedAt: publisher.updatedAt,
  };
}
