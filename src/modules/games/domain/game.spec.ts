import { describe, expect, it } from 'vitest';

import { InvariantViolationError } from '../../../shared/domain/index.js';
import { GameAlreadyDiscountedError } from './game.errors.js';
import { Game } from './game.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const LATER = new Date('2026-09-20T12:00:00.000Z');
const PUBLISHER_ID = '2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21';

const details = {
  title: '  Hollow Knight  ',
  price: 14.99,
  tags: ['Metroidvania', 'indie', 'INDIE'],
  releaseDate: new Date('2025-02-24T00:00:00.000Z'),
  publisherId: PUBLISHER_ID,
};

describe('Game', () => {
  it('is created with normalised value objects and no discount', () => {
    const game = Game.create(details, NOW);

    expect(game.title.value).toBe('Hollow Knight');
    expect(game.price.cents).toBe(1499);
    expect(game.tags.value).toEqual(['metroidvania', 'indie']);
    expect(game.publisherId?.value).toBe(PUBLISHER_ID);
    expect(game.discount).toBeNull();
    expect(game.isDiscounted).toBe(false);
    expect(game.createdAt).toEqual(NOW);
    expect(game.updatedAt).toEqual(NOW);
  });

  it('rejects invalid details', () => {
    expect(() => Game.create({ ...details, title: '' }, NOW)).toThrow(InvariantViolationError);
    expect(() => Game.create({ ...details, price: -5 }, NOW)).toThrow(InvariantViolationError);
    expect(() => Game.create({ ...details, publisherId: 'nope' }, NOW)).toThrow(
      InvariantViolationError,
    );
  });

  it('applies a discount exactly once', () => {
    const game = Game.create(details, NOW);

    game.applyDiscount(20, LATER);

    expect(game.price.cents).toBe(1199);
    expect(game.discount?.percentage).toBe(20);
    expect(game.discount?.appliedAt).toEqual(LATER);
    expect(game.updatedAt).toEqual(LATER);
    expect(() => {
      game.applyDiscount(10, LATER);
    }).toThrow(GameAlreadyDiscountedError);
  });

  it('keeps the discount on update unless the price changes', () => {
    const game = Game.create(details, NOW);
    game.applyDiscount(20, NOW);

    game.update({ ...details, price: 11.99, title: 'Renamed' }, LATER);
    expect(game.discount?.percentage).toBe(20);
    expect(game.title.value).toBe('Renamed');

    game.update({ ...details, price: 29.99 }, LATER);
    expect(game.discount).toBeNull();
    expect(game.price.cents).toBe(2999);
  });

  it('detaches its publisher idempotently', () => {
    const game = Game.create(details, NOW);

    game.detachPublisher(LATER);
    expect(game.publisherId).toBeNull();
    expect(game.updatedAt).toEqual(LATER);

    game.detachPublisher(new Date('2026-09-21T00:00:00.000Z'));
    expect(game.updatedAt).toEqual(LATER);
  });

  it('answers release-date questions', () => {
    const game = Game.create(details, NOW);
    expect(game.wasReleasedBefore(new Date('2025-02-25T00:00:00.000Z'))).toBe(true);
    expect(game.wasReleasedBefore(new Date('2025-02-24T00:00:00.000Z'))).toBe(false);
  });
});
