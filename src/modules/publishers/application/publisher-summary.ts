import type { Publisher } from '../domain/publisher.js';

/** Read model exposed to other bounded contexts. */
export interface PublisherSummary {
  readonly id: string;
  readonly name: string;
  readonly siret: string;
  readonly phone: string;
}

export function toPublisherSummary(publisher: Publisher): PublisherSummary {
  return {
    id: publisher.id.value,
    name: publisher.name.value,
    siret: publisher.siret.value,
    phone: publisher.phone.value,
  };
}
