import { Inject, Injectable } from '@nestjs/common';

import type { UseCase } from '../../../../shared/application/index.js';
import type { Clock } from '../../../../shared/domain/index.js';
import { CLOCK } from '../../../../shared/domain/index.js';
import { SiretAlreadyRegisteredError } from '../../domain/publisher.errors.js';
import type { PublisherDetails } from '../../domain/publisher.js';
import { Publisher } from '../../domain/publisher.js';
import type { PublisherRepository } from '../../domain/publisher.repository.js';
import { PUBLISHER_REPOSITORY } from '../../domain/publisher.repository.js';
import { Siret } from '../../domain/value-objects/siret.js';

export type CreatePublisherCommand = PublisherDetails;

@Injectable()
export class CreatePublisherUseCase implements UseCase<CreatePublisherCommand, Publisher> {
  constructor(
    @Inject(PUBLISHER_REPOSITORY) private readonly publishers: PublisherRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(command: CreatePublisherCommand): Promise<Publisher> {
    const siret = Siret.create(command.siret);
    if (await this.publishers.existsWithSiret(siret)) {
      throw new SiretAlreadyRegisteredError(siret.value);
    }

    const publisher = Publisher.create(command, this.clock.now());
    await this.publishers.save(publisher);
    return publisher;
  }
}
