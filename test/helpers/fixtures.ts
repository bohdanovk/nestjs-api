import type { Session } from './auth.js';
import type { TestApp } from './test-app.js';

export const publisherInput = {
  name: 'Team Cherry',
  siret: '73282932000074',
  phone: '+61 2 1234 5678',
};

export function gameInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: 'Hollow Knight',
    price: 14.99,
    tags: ['Metroidvania', 'indie'],
    releaseDate: '2017-02-24T00:00:00.000Z',
    publisherId: null,
    ...overrides,
  };
}

export async function createPublisher(
  app: TestApp,
  session: Session,
  overrides: Record<string, unknown> = {},
): Promise<{ id: string; name: string; siret: string; phone: string; updatedAt: string }> {
  const response = await app
    .http()
    .post('/api/v1/publishers')
    .set('Authorization', session.bearer)
    .send({ ...publisherInput, ...overrides })
    .expect(201);
  return response.body as {
    id: string;
    name: string;
    siret: string;
    phone: string;
    updatedAt: string;
  };
}

export async function createGame(
  app: TestApp,
  session: Session,
  overrides: Record<string, unknown> = {},
): Promise<{ id: string; price: number; publisherId: string | null }> {
  const response = await app
    .http()
    .post('/api/v1/games')
    .set('Authorization', session.bearer)
    .send(gameInput(overrides))
    .expect(201);
  return response.body as { id: string; price: number; publisherId: string | null };
}

/** Builds an ISO date `months` months before now (mid-month to avoid end-of-month quirks). */
export function monthsAgo(months: number): string {
  const date = new Date();
  date.setUTCDate(15);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString();
}
