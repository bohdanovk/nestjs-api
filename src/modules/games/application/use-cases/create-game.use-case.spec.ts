import { describe, expect, it } from 'vitest';

import { PublisherNotFoundError } from '../../../publishers/index.js';
import { InMemoryGameRepository } from '../../testing/in-memory-game.repository.js';
import { CreateGameUseCase } from './create-game.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const KNOWN_PUBLISHER = '2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21';
const UNKNOWN_PUBLISHER = '9e0f2f4c-2a5d-4c0b-8f0a-6b9c1d2e3f40';

const publishers = {
  exists: (id: string): Promise<boolean> => Promise.resolve(id === KNOWN_PUBLISHER),
  findById: (): Promise<null> => Promise.resolve(null),
};

const command = {
  title: 'Celeste',
  price: 19.99,
  tags: ['platformer'],
  releaseDate: new Date('2018-01-25T00:00:00.000Z'),
  publisherId: KNOWN_PUBLISHER,
};

describe('CreateGameUseCase', () => {
  it('persists a new game referencing an existing publisher', async () => {
    const games = new InMemoryGameRepository();
    const useCase = new CreateGameUseCase(games, publishers, { now: () => NOW });

    const game = await useCase.execute(command);

    expect(await games.findById(game.id)).toBe(game);
    expect(game.publisherId?.value).toBe(KNOWN_PUBLISHER);
  });

  it('accepts games without a publisher', async () => {
    const useCase = new CreateGameUseCase(new InMemoryGameRepository(), publishers, {
      now: () => NOW,
    });

    const game = await useCase.execute({ ...command, publisherId: null });

    expect(game.publisherId).toBeNull();
  });

  it('rejects unknown publishers without persisting anything', async () => {
    const games = new InMemoryGameRepository();
    const useCase = new CreateGameUseCase(games, publishers, { now: () => NOW });

    await expect(useCase.execute({ ...command, publisherId: UNKNOWN_PUBLISHER })).rejects.toThrow(
      PublisherNotFoundError,
    );
    expect(games.all).toHaveLength(0);
  });
});
