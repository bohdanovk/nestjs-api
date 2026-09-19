import type { Page } from '../../../shared/domain/index.js';
import type { Publisher } from '../domain/publisher.js';
import type { PublisherPage, PublisherResponse } from './publisher.schemas.js';

export function toPublisherResponse(publisher: Publisher): PublisherResponse {
  return {
    id: publisher.id.value,
    name: publisher.name.value,
    siret: publisher.siret.value,
    phone: publisher.phone.value,
    createdAt: publisher.createdAt.toISOString(),
    updatedAt: publisher.updatedAt.toISOString(),
  };
}

export function toPublisherPage(page: Page<Publisher>): PublisherPage {
  return {
    items: page.items.map(toPublisherResponse),
    total: page.total,
    page: page.page,
    pageSize: page.pageSize,
  };
}
