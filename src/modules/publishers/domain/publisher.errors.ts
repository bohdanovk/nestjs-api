import { ConflictError, NotFoundError } from '../../../shared/domain/index.js';

export class PublisherNotFoundError extends NotFoundError {
  readonly code = 'PUBLISHER_NOT_FOUND';

  constructor(publisherId: string) {
    super(`Publisher "${publisherId}" was not found`, { publisherId });
  }
}

export class SiretAlreadyRegisteredError extends ConflictError {
  readonly code = 'SIRET_ALREADY_REGISTERED';

  constructor(siret: string) {
    super(`A publisher with SIRET "${siret}" already exists`, { siret });
  }
}
