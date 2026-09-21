import type { Page, PageRequest } from '../../../shared/domain/index.js';
import { toOffset } from '../../../shared/domain/index.js';
import type { Publisher } from '../domain/publisher.js';
import type { PublisherRepository } from '../domain/publisher.repository.js';
import type { PublisherId } from '../domain/publisher-id.js';
import type { Siret } from '../domain/value-objects/siret.js';

export class InMemoryPublisherRepository implements PublisherRepository {
  private readonly store = new Map<string, Publisher>();

  seed(...publishers: readonly Publisher[]): this {
    for (const publisher of publishers) this.store.set(publisher.id.value, publisher);
    return this;
  }

  findById(id: PublisherId): Promise<Publisher | null> {
    return Promise.resolve(this.store.get(id.value) ?? null);
  }

  findPage(request: PageRequest): Promise<Page<Publisher>> {
    const all = [...this.store.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const offset = toOffset(request);
    return Promise.resolve({
      items: all.slice(offset, offset + request.pageSize),
      total: all.length,
      page: request.page,
      pageSize: request.pageSize,
    });
  }

  existsWithSiret(siret: Siret, excluding?: PublisherId): Promise<boolean> {
    return Promise.resolve(
      [...this.store.values()].some(
        (publisher) => publisher.siret.equals(siret) && !publisher.id.equals(excluding),
      ),
    );
  }

  save(publisher: Publisher): Promise<void> {
    this.store.set(publisher.id.value, publisher);
    return Promise.resolve();
  }

  delete(id: PublisherId): Promise<boolean> {
    return Promise.resolve(this.store.delete(id.value));
  }
}
