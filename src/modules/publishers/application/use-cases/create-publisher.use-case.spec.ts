import { describe, expect, it } from 'vitest';

import { SiretAlreadyRegisteredError } from '../../domain/publisher.errors.js';
import { Publisher } from '../../domain/publisher.js';
import { InMemoryPublisherRepository } from '../../testing/in-memory-publisher.repository.js';
import { CreatePublisherUseCase } from './create-publisher.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const clock = { now: (): Date => NOW };
const command = { name: 'Team Cherry', siret: '73282932000074', phone: '+61212345678' };

describe('CreatePublisherUseCase', () => {
  it('persists a new publisher', async () => {
    const publishers = new InMemoryPublisherRepository();
    const useCase = new CreatePublisherUseCase(publishers, clock);

    const publisher = await useCase.execute(command);

    expect(await publishers.findById(publisher.id)).toBe(publisher);
    expect(publisher.createdAt).toEqual(NOW);
  });

  it('rejects a duplicate SIRET', async () => {
    const publishers = new InMemoryPublisherRepository().seed(Publisher.create(command, NOW));
    const useCase = new CreatePublisherUseCase(publishers, clock);

    await expect(useCase.execute({ ...command, name: 'Other' })).rejects.toThrow(
      SiretAlreadyRegisteredError,
    );
  });
});
