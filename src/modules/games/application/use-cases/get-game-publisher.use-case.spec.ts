import { describe, expect, it } from 'vitest';

import type { PublisherSummary } from '../../../publishers/index.js';
import { PublisherNotFoundError } from '../../../publishers/index.js';
import { GameHasNoPublisherError, GameNotFoundError } from '../../domain/game.errors.js';
import { Game } from '../../domain/game.js';
import { InMemoryGameRepository } from '../../testing/in-memory-game.repository.js';
import { GetGamePublisherUseCase } from './get-game-publisher.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const PUBLISHER: PublisherSummary = {
  id: '2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21',
  name: 'Team Cherry',
  siret: '73282932000074',
  phone: '+61212345678',
};

const publishers = {
  exists: (id: string): Promise<boolean> => Promise.resolve(id === PUBLISHER.id),
  findById: (id: string): Promise<PublisherSummary | null> =>
    Promise.resolve(id === PUBLISHER.id ? PUBLISHER : null),
};

function game(publisherId: string | null): Game {
  return Game.create({ title: 'x', price: 1, tags: [], releaseDate: NOW, publisherId }, NOW);
}

describe('GetGamePublisherUseCase', () => {
  it("returns the game's publisher", async () => {
    const owned = game(PUBLISHER.id);
    const useCase = new GetGamePublisherUseCase(
      new InMemoryGameRepository().seed(owned),
      publishers,
    );

    await expect(useCase.execute({ gameId: owned.id.value })).resolves.toEqual(PUBLISHER);
  });

  it('fails when the game does not exist', async () => {
    const useCase = new GetGamePublisherUseCase(new InMemoryGameRepository(), publishers);

    await expect(useCase.execute({ gameId: PUBLISHER.id })).rejects.toThrow(GameNotFoundError);
  });

  it('fails when the game has no publisher', async () => {
    const orphan = game(null);
    const useCase = new GetGamePublisherUseCase(
      new InMemoryGameRepository().seed(orphan),
      publishers,
    );

    await expect(useCase.execute({ gameId: orphan.id.value })).rejects.toThrow(
      GameHasNoPublisherError,
    );
  });

  it('fails when the referenced publisher no longer exists', async () => {
    const dangling = game('9e0f2f4c-2a5d-4c0b-8f0a-6b9c1d2e3f40');
    const useCase = new GetGamePublisherUseCase(
      new InMemoryGameRepository().seed(dangling),
      publishers,
    );

    await expect(useCase.execute({ gameId: dangling.id.value })).rejects.toThrow(
      PublisherNotFoundError,
    );
  });
});
