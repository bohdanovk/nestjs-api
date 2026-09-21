import { beforeEach, describe, expect, it } from 'vitest';

import { CatalogLifecyclePolicy } from '../../domain/catalog-lifecycle-policy.js';
import { Game } from '../../domain/game.js';
import { InMemoryGameRepository } from '../../testing/in-memory-game.repository.js';
import { RunCatalogMaintenanceUseCase } from './run-catalog-maintenance.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const clock = { now: (): Date => NOW };

function gameReleasedOn(iso: string, title: string, price = 50): Game {
  return Game.create(
    { title, price, tags: [], releaseDate: new Date(iso), publisherId: null },
    new Date('2024-01-01T00:00:00.000Z'),
  );
}

describe('RunCatalogMaintenanceUseCase', () => {
  let games: InMemoryGameRepository;
  let useCase: RunCatalogMaintenanceUseCase;

  beforeEach(() => {
    games = new InMemoryGameRepository();
    useCase = new RunCatalogMaintenanceUseCase(games, new CatalogLifecyclePolicy(), clock);
  });

  it('retires games older than 18 months and discounts games aged 12-18 months once', async () => {
    const ancient = gameReleasedOn('2025-01-01T00:00:00.000Z', 'ancient');
    const boundaryRetire = gameReleasedOn('2025-03-19T11:59:59.999Z', 'just-too-old');
    const boundaryKeep = gameReleasedOn('2025-03-19T12:00:00.000Z', 'exactly-18-months');
    const middle = gameReleasedOn('2025-06-01T00:00:00.000Z', 'middle', 19.99);
    const alreadyDiscounted = gameReleasedOn('2025-06-01T00:00:00.000Z', 'discounted');
    alreadyDiscounted.applyDiscount(20, new Date('2026-01-01T00:00:00.000Z'));
    const recent = gameReleasedOn('2026-05-01T00:00:00.000Z', 'recent');
    games.seed(ancient, boundaryRetire, boundaryKeep, middle, alreadyDiscounted, recent);

    const report = await useCase.execute();

    expect(report.retiredCount).toBe(2);
    expect(report.discountedGames.map((game) => game.title.value).sort()).toEqual([
      'exactly-18-months',
      'middle',
    ]);
    expect(middle.price.cents).toBe(1599);
    expect(boundaryKeep.price.cents).toBe(4000);
    expect(alreadyDiscounted.price.cents).toBe(4000);
    expect(recent.price.cents).toBe(5000);
    expect(games.all.map((game) => game.title.value).sort()).toEqual([
      'discounted',
      'exactly-18-months',
      'middle',
      'recent',
    ]);
  });

  it('is a no-op on an empty catalog', async () => {
    await expect(useCase.execute()).resolves.toEqual({ retiredCount: 0, discountedGames: [] });
  });
});
