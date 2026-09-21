import type { Page, PageRequest } from '../../../shared/domain/index.js';
import type { Publisher } from './publisher.js';
import type { PublisherId } from './publisher-id.js';
import type { Siret } from './value-objects/siret.js';

export interface PublisherRepository {
  findById(id: PublisherId): Promise<Publisher | null>;
  findPage(request: PageRequest): Promise<Page<Publisher>>;
  existsWithSiret(siret: Siret, excluding?: PublisherId): Promise<boolean>;
  /** Inserts or fully replaces the aggregate. */
  save(publisher: Publisher): Promise<void>;
  /** Returns false when nothing was deleted. */
  delete(id: PublisherId): Promise<boolean>;
}

export const PUBLISHER_REPOSITORY = Symbol('PublisherRepository');
