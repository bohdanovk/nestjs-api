import { Inject, Injectable } from '@nestjs/common';

import type { PublisherRepository } from '../domain/publisher.repository.js';
import { PUBLISHER_REPOSITORY } from '../domain/publisher.repository.js';
import { PublisherId } from '../domain/publisher-id.js';
import type { PublisherLookup } from './ports/publisher-lookup.js';
import type { PublisherSummary } from './publisher-summary.js';
import { toPublisherSummary } from './publisher-summary.js';

@Injectable()
export class PublisherLookupService implements PublisherLookup {
  constructor(@Inject(PUBLISHER_REPOSITORY) private readonly publishers: PublisherRepository) {}

  async findById(publisherId: string): Promise<PublisherSummary | null> {
    const publisher = await this.publishers.findById(PublisherId.create(publisherId));
    return publisher === null ? null : toPublisherSummary(publisher);
  }

  async exists(publisherId: string): Promise<boolean> {
    return (await this.publishers.findById(PublisherId.create(publisherId))) !== null;
  }
}
