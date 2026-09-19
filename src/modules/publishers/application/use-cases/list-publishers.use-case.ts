import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Page, PageRequest } from '../../../../shared/domain/index.js';
import type { Publisher } from '../../domain/publisher.js';
import type { PublisherRepository } from '../../domain/publisher.repository.js';
import { PUBLISHER_REPOSITORY } from '../../domain/publisher.repository.js';

export type ListPublishersQuery = PageRequest;

@Injectable()
export class ListPublishersUseCase implements UseCase<ListPublishersQuery, Page<Publisher>> {
  constructor(@Inject(PUBLISHER_REPOSITORY) private readonly publishers: PublisherRepository) {}

  execute(query: ListPublishersQuery): Promise<Page<Publisher>> {
    return this.publishers.findPage(query);
  }
}
