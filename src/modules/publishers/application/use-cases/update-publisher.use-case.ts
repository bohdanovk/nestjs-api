import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import {
  PublisherNotFoundError,
  SiretAlreadyRegisteredError,
} from '../../domain/publisher.errors.js';
import type { Publisher, PublisherDetails } from '../../domain/publisher.js';
import type { PublisherRepository } from '../../domain/publisher.repository.js';
import { PUBLISHER_REPOSITORY } from '../../domain/publisher.repository.js';
import { PublisherId } from '../../domain/publisher-id.js';
import { Siret } from '../../domain/value-objects/siret.js';

export interface UpdatePublisherCommand extends PublisherDetails {
  readonly publisherId: string;
}

@Injectable()
export class UpdatePublisherUseCase implements UseCase<UpdatePublisherCommand, Publisher> {
  constructor(
    @Inject(PUBLISHER_REPOSITORY) private readonly publishers: PublisherRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: UpdatePublisherCommand): Promise<Publisher> {
    const id = PublisherId.create(command.publisherId);
    const publisher = await this.publishers.findById(id);
    if (publisher === null) {
      throw new PublisherNotFoundError(command.publisherId);
    }

    const siret = Siret.create(command.siret);
    if (!siret.equals(publisher.siret) && (await this.publishers.existsWithSiret(siret, id))) {
      throw new SiretAlreadyRegisteredError(siret.value);
    }

    publisher.update(command, this.clock.now());
    await this.publishers.save(publisher);
    return publisher;
  }
}
