import type { Page, PageRequest } from '../../../shared/domain/index.js';
import { toOffset } from '../../../shared/domain/index.js';
import type { DateWindow } from '../domain/catalog-lifecycle-policy.js';
import type { Game } from '../domain/game.js';
import type { GameRepository } from '../domain/game.repository.js';
import type { GameId } from '../domain/game-id.js';
import type { PublisherRef } from '../domain/publisher-ref.js';

export class InMemoryGameRepository implements GameRepository {
  private readonly store = new Map<string, Game>();

  seed(...games: readonly Game[]): this {
    for (const game of games) this.store.set(game.id.value, game);
    return this;
  }

  get all(): Game[] {
    return [...this.store.values()];
  }

  findById(id: GameId): Promise<Game | null> {
    return Promise.resolve(this.store.get(id.value) ?? null);
  }

  findPage(request: PageRequest): Promise<Page<Game>> {
    const all = this.all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const offset = toOffset(request);
    return Promise.resolve({
      items: all.slice(offset, offset + request.pageSize),
      total: all.length,
      page: request.page,
      pageSize: request.pageSize,
    });
  }

  findDiscountCandidates(window: DateWindow): Promise<Game[]> {
    return Promise.resolve(
      this.all.filter(
        (game) =>
          !game.isDiscounted &&
          game.releaseDate.getTime() >= window.from.getTime() &&
          game.releaseDate.getTime() <= window.to.getTime(),
      ),
    );
  }

  save(game: Game): Promise<void> {
    this.store.set(game.id.value, game);
    return Promise.resolve();
  }

  async saveAll(games: readonly Game[]): Promise<void> {
    for (const game of games) await this.save(game);
  }

  delete(id: GameId): Promise<boolean> {
    return Promise.resolve(this.store.delete(id.value));
  }

  deleteReleasedBefore(date: Date): Promise<number> {
    const victims = this.all.filter((game) => game.wasReleasedBefore(date));
    for (const game of victims) this.store.delete(game.id.value);
    return Promise.resolve(victims.length);
  }

  detachPublisher(publisherId: PublisherRef, now: Date): Promise<number> {
    const affected = this.all.filter((game) => game.publisherId?.equals(publisherId) ?? false);
    for (const game of affected) game.detachPublisher(now);
    return Promise.resolve(affected.length);
  }
}
