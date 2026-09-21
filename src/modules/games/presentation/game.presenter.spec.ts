import { describe, expect, it } from 'vitest';

import { Game } from '../domain/game.js';
import { toCatalogMaintenanceResponse, toGamePage, toGameResponse } from './game.presenter.js';
import {
  catalogMaintenanceResponseSchema,
  gamePageSchema,
  gameResponseSchema,
} from './game.schemas.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');

const game = Game.create(
  {
    title: 'Outer Wilds',
    price: 24.99,
    tags: ['Exploration'],
    releaseDate: new Date('2019-05-28T00:00:00.000Z'),
    publisherId: '2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21',
  },
  NOW,
);

describe('game presenter', () => {
  it('produces a response that satisfies the documented schema', () => {
    const response = toGameResponse(game);

    expect(gameResponseSchema.parse(response)).toEqual(response);
    expect(response).toMatchObject({
      title: 'Outer Wilds',
      price: 24.99,
      tags: ['exploration'],
      releaseDate: '2019-05-28T00:00:00.000Z',
      discount: null,
      createdAt: NOW.toISOString(),
    });
  });

  it('renders discounts', () => {
    const discounted = Game.create(
      { title: 'x', price: 10, tags: [], releaseDate: NOW, publisherId: null },
      NOW,
    );
    discounted.applyDiscount(20, NOW);

    expect(toGameResponse(discounted).discount).toEqual({
      percentage: 20,
      appliedAt: NOW.toISOString(),
    });
  });

  it('renders pages and maintenance reports against their schemas', () => {
    const page = toGamePage({ items: [game], total: 1, page: 1, pageSize: 20 });
    expect(gamePageSchema.parse(page)).toEqual(page);

    const report = toCatalogMaintenanceResponse({ retiredCount: 3, discountedGames: [game] });
    expect(catalogMaintenanceResponseSchema.parse(report)).toEqual(report);
  });
});
