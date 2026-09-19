import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { registerAndLogin, type Session } from './helpers/auth.js';
import { createGame, createPublisher, publisherInput } from './helpers/fixtures.js';
import { createTestApp, type TestApp } from './helpers/test-app.js';

describe('publishers', () => {
  let app: TestApp;
  let session: Session;

  beforeAll(async () => {
    app = await createTestApp();
    session = await registerAndLogin(app);
  });

  afterAll(() => app.close());

  it('requires authentication for writes but not for reads', async () => {
    await app.http().post('/api/v1/publishers').send(publisherInput).expect(401);
    await app.http().get('/api/v1/publishers').expect(200);
  });

  it('creates, reads, updates and deletes a publisher', async () => {
    const created = await createPublisher(app, session);
    expect(created).toMatchObject({
      name: 'Team Cherry',
      siret: '73282932000074',
      phone: '+61212345678',
    });

    const fetched = await app.http().get(`/api/v1/publishers/${created.id}`).expect(200);
    expect(fetched.body).toEqual(created);

    const updated = await app
      .http()
      .put(`/api/v1/publishers/${created.id}`)
      .set('Authorization', session.bearer)
      .send({ ...publisherInput, name: 'Team Cherry Pty Ltd' })
      .expect(200);
    expect(updated.body).toMatchObject({ id: created.id, name: 'Team Cherry Pty Ltd' });
    expect(updated.body.updatedAt > created.updatedAt).toBe(true);

    await app
      .http()
      .delete(`/api/v1/publishers/${created.id}`)
      .set('Authorization', session.bearer)
      .expect(204);
    const gone = await app.http().get(`/api/v1/publishers/${created.id}`).expect(404);
    expect(gone.body).toMatchObject({ status: 404, code: 'PUBLISHER_NOT_FOUND' });
  });

  it('paginates newest first', async () => {
    const isolated = await createTestApp();
    try {
      const owner = await registerAndLogin(isolated);
      const ids: string[] = [];
      for (let index = 0; index < 3; index += 1) {
        ids.push((await createPublisher(isolated, owner, { siret: uniqueSiret(index) })).id);
      }

      const page = await isolated.http().get('/api/v1/publishers?page=1&pageSize=2').expect(200);
      expect(page.body).toMatchObject({ total: 3, page: 1, pageSize: 2 });
      expect(page.body.items.map((item: { id: string }) => item.id)).toEqual([ids[2], ids[1]]);

      const last = await isolated.http().get('/api/v1/publishers?page=2&pageSize=2').expect(200);
      expect(last.body.items).toHaveLength(1);

      await isolated.http().get('/api/v1/publishers?pageSize=1000').expect(400);
    } finally {
      await isolated.close();
    }
  });

  it('rejects duplicate SIRETs with 409 and invalid SIRETs with 422', async () => {
    const siret = uniqueSiret(7);
    await createPublisher(app, session, { siret });

    const duplicate = await app
      .http()
      .post('/api/v1/publishers')
      .set('Authorization', session.bearer)
      .send({ ...publisherInput, siret })
      .expect(409);
    expect(duplicate.body.code).toBe('SIRET_ALREADY_REGISTERED');

    const badChecksum = await app
      .http()
      .post('/api/v1/publishers')
      .set('Authorization', session.bearer)
      .send({ ...publisherInput, siret: '73282932000075' })
      .expect(422);
    expect(badChecksum.body).toMatchObject({ code: 'INVARIANT_VIOLATION' });
  });

  it('validates identifiers and payloads', async () => {
    await app.http().get('/api/v1/publishers/not-a-uuid').expect(400);
    await app.http().get(`/api/v1/publishers/${randomUUID()}`).expect(404);
    const response = await app
      .http()
      .post('/api/v1/publishers')
      .set('Authorization', session.bearer)
      .send({ name: '', siret: '12', phone: 'abc' })
      .expect(400);
    expect(response.body.errors.map((error: { path: string }) => error.path).sort()).toEqual([
      'name',
      'phone',
      'siret',
    ]);
  });

  it('detaches games when their publisher is deleted', async () => {
    const publisher = await createPublisher(app, session, { siret: uniqueSiret(11) });
    const game = await createGame(app, session, { publisherId: publisher.id });
    expect(game.publisherId).toBe(publisher.id);

    await app
      .http()
      .delete(`/api/v1/publishers/${publisher.id}`)
      .set('Authorization', session.bearer)
      .expect(204);

    const detached = await app.http().get(`/api/v1/games/${game.id}`).expect(200);
    expect(detached.body.publisherId).toBeNull();
    const publisherOfGame = await app.http().get(`/api/v1/games/${game.id}/publisher`).expect(404);
    expect(publisherOfGame.body.code).toBe('GAME_HAS_NO_PUBLISHER');
  });
});

/** Valid SIRETs derived from a fixed SIREN with different establishment numbers. */
function uniqueSiret(index: number): string {
  const base = `732829320${String(index).padStart(4, '0')}`;
  for (let check = 0; check <= 9; check += 1) {
    const candidate = `${base}${check}`;
    if (luhn(candidate)) return candidate;
  }
  throw new Error('unreachable');
}

function luhn(digits: string): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
