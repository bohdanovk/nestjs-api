import type { PublisherSummary } from '../publisher-summary.js';

/**
 * Public query port of the Publishers context. Other contexts depend on this
 * interface (via the module's index) instead of on repositories or entities.
 */
export interface PublisherLookup {
  findById(publisherId: string): Promise<PublisherSummary | null>;
  exists(publisherId: string): Promise<boolean>;
}

export const PUBLISHER_LOOKUP = Symbol('PublisherLookup');
