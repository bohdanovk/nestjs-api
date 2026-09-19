import type { PublisherLookup } from '../../publishers/index.js';
import { PublisherNotFoundError } from '../../publishers/index.js';

/** Shared guard clause: a game may only reference a publisher that exists. */
export async function assertPublisherExists(
  publishers: PublisherLookup,
  publisherId: string | null,
): Promise<void> {
  if (publisherId !== null && !(await publishers.exists(publisherId))) {
    throw new PublisherNotFoundError(publisherId);
  }
}
