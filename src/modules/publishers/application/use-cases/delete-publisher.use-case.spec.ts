import { describe, expect, it } from 'vitest';

import type { DomainEvent } from '../../../../shared/domain/index.js';
import { PublisherDeletedEvent } from '../../domain/events/publisher-deleted.event.js';
import { PublisherNotFoundError } from '../../domain/publisher.errors.js';
import { Publisher } from '../../domain/publisher.js';
import { InMemoryPublisherRepository } from '../../testing/in-memory-publisher.repository.js';
import { DeletePublisherUseCase } from './delete-publisher.use-case.js';

const NOW = new Date('2026-09-19T12:00:00.000Z');
const clock = { now: (): Date => NOW };

describe('DeletePublisherUseCase', () => {
  it('deletes the publisher and publishes PublisherDeletedEvent', async () => {
    const publisher = Publisher.create(
      { name: 'Team Cherry', siret: '73282932000074', phone: '+61212345678' },
      NOW,
    );
    const publishers = new InMemoryPublisherRepository().seed(publisher);
    const published: DomainEvent[] = [];
    const events = {
      publishAll: (batch: readonly DomainEvent[]): Promise<void> => {
        published.push(...batch);
        return Promise.resolve();
      },
    };
    const useCase = new DeletePublisherUseCase(publishers, events, clock);

    await useCase.execute({ publisherId: publisher.id.value });

    expect(await publishers.findById(publisher.id)).toBeNull();
    expect(published).toHaveLength(1);
    const [event] = published;
    expect(event).toBeInstanceOf(PublisherDeletedEvent);
    expect((event as PublisherDeletedEvent).publisherId).toBe(publisher.id.value);
    expect(event?.occurredAt).toEqual(NOW);
  });

  it('fails for an unknown publisher and publishes nothing', async () => {
    const events = { publishAll: (): Promise<void> => Promise.reject(new Error('unexpected')) };
    const useCase = new DeletePublisherUseCase(new InMemoryPublisherRepository(), events, clock);

    await expect(
      useCase.execute({ publisherId: '2f1b7f60-6e5f-4c4e-9f19-8b8e0c4f9d21' }),
    ).rejects.toThrow(PublisherNotFoundError);
  });
});
