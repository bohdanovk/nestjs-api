import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import { PublisherNotFoundError } from '../../domain/publisher.errors.js';
import type { Publisher } from '../../domain/publisher.js';
import type { PublisherRepository } from '../../domain/publisher.repository.js';
import { PUBLISHER_REPOSITORY } from '../../domain/publisher.repository.js';
import { PublisherId } from '../../domain/publisher-id.js';

export interface GetPublisherQuery {
  readonly publisherId: string;
}

@Injectable()
export class GetPublisherUseCase implements UseCase<GetPublisherQuery, Publisher> {
  constructor(@Inject(PUBLISHER_REPOSITORY) private readonly publishers: PublisherRepository) {}

  async execute(query: GetPublisherQuery): Promise<Publisher> {
    const publisher = await this.publishers.findById(PublisherId.create(query.publisherId));
    if (publisher === null) {
      throw new PublisherNotFoundError(query.publisherId);
    }
    return publisher;
  }
}
