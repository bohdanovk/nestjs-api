import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { loginAsAdmin, registerAndLogin, type Session } from './helpers/auth.js';
import { createGame, createPublisher, gameInput, monthsAgo } from './helpers/fixtures.js';
import { createTestApp, type TestApp } from './helpers/test-app.js';

describe('games', () => {
  let app: TestApp;
  let session: Session;

  beforeAll(async () => {
    app = await createTestApp();
    session = await registerAndLogin(app);
  });

  afterAll(() => app.close());

  it('requires authentication for writes but not for reads', async () => {
    await app.http().post('/api/v1/games').send(gameInput()).expect(401);
    await app.http().get('/api/v1/games').expect(200);
  });

  it('creates, reads, updates and deletes a game', async () => {
    const created = await app
      .http()
      .post('/api/v1/games')
      .set('Authorization', session.bearer)
      .send(gameInput())
      .expect(201);
    expect(created.body).toMatchObject({
      title: 'Hollow Knight',
      price: 14.99,
      tags: ['metroidvania', 'indie'],
      releaseDate: '2017-02-24T00:00:00.000Z',
      publisherId: null,
      discount: null,
    });
    expect(created.body.id).toMatch(/^[0-9a-f-]{36}$/);

    const fetched = await app
      .http()
      .get(`/api/v1/games/${created.body.id as string}`)
      .expect(200);
    expect(fetched.body).toEqual(created.body);

    const updated = await app
      .http()
      .put(`/api/v1/games/${created.body.id as string}`)
      .set('Authorization', session.bearer)
      .send(gameInput({ title: 'Hollow Knight: Voidheart Edition', price: 9.99, tags: [] }))
      .expect(200);
    expect(updated.body).toMatchObject({
      title: 'Hollow Knight: Voidheart Edition',
      price: 9.99,
      tags: [],
    });

    await app
      .http()
      .delete(`/api/v1/games/${created.body.id as string}`)
      .set('Authorization', session.bearer)
      .expect(204);
    await app
      .http()
      .get(`/api/v1/games/${created.body.id as string}`)
      .expect(404);
    await app
      .http()
      .delete(`/api/v1/games/${created.body.id as string}`)
      .set('Authorization', session.bearer)
      .expect(404);
  });

  it('validates the payload strictly', async () => {
    const response = await app
      .http()
      .post('/api/v1/games')
      .set('Authorization', session.bearer)
      .send({ title: '', price: 1.999, releaseDate: 'yesterday', publisherId: 'x', extra: 1 })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, title: 'Bad Request' });
    expect(response.body.errors.map((error: { path: string }) => error.path)).toEqual(
      expect.arrayContaining(['title', 'price', 'releaseDate', 'publisherId', '']),
    );
  });

  it('links games to existing publishers only', async () => {
    const missing = await app
      .http()
      .post('/api/v1/games')
      .set('Authorization', session.bearer)
      .send(gameInput({ publisherId: randomUUID() }))
      .expect(404);
    expect(missing.body.code).toBe('PUBLISHER_NOT_FOUND');

    const publisher = await createPublisher(app, session);
    const game = await createGame(app, session, { publisherId: publisher.id });

    const viaGame = await app.http().get(`/api/v1/games/${game.id}/publisher`).expect(200);
    expect(viaGame.body).toEqual({
      id: publisher.id,
      name: publisher.name,
      siret: publisher.siret,
      phone: publisher.phone,
    });
  });

  it('paginates', async () => {
    const list = await app.http().get('/api/v1/games?page=1&pageSize=1').expect(200);
    expect(list.body).toMatchObject({ page: 1, pageSize: 1 });
    expect(list.body.items.length).toBeLessThanOrEqual(1);
    await app.http().get('/api/v1/games?page=0').expect(400);
  });

  describe('POST /api/v1/games/maintenance', () => {
    it('is restricted to admins', async () => {
      await app.http().post('/api/v1/games/maintenance').expect(401);
      const forbidden = await app
        .http()
        .post('/api/v1/games/maintenance')
        .set('Authorization', session.bearer)
        .expect(403);
      expect(forbidden.body).toMatchObject({ status: 403, title: 'Forbidden' });
    });

    it('retires old games and discounts ageing ones exactly once', async () => {
      const isolated = await createTestApp();
      try {
        const owner = await registerAndLogin(isolated);
        const admin = await loginAsAdmin(isolated);
        const ancient = await createGame(isolated, owner, {
          title: 'ancient',
          releaseDate: monthsAgo(20),
        });
        const ageing = await createGame(isolated, owner, {
          title: 'ageing',
          releaseDate: monthsAgo(15),
          price: 50,
        });
        const fresh = await createGame(isolated, owner, {
          title: 'fresh',
          releaseDate: monthsAgo(3),
        });

        const first = await isolated
          .http()
          .post('/api/v1/games/maintenance')
          .set('Authorization', admin.bearer)
          .expect(200);
        expect(first.body.retiredCount).toBe(1);
        expect(first.body.discountedGames).toHaveLength(1);
        expect(first.body.discountedGames[0]).toMatchObject({
          id: ageing.id,
          price: 40,
          discount: { percentage: 20 },
        });

        await isolated.http().get(`/api/v1/games/${ancient.id}`).expect(404);
        const untouched = await isolated.http().get(`/api/v1/games/${fresh.id}`).expect(200);
        expect(untouched.body.discount).toBeNull();

        const second = await isolated
          .http()
          .post('/api/v1/games/maintenance')
          .set('Authorization', admin.bearer)
          .expect(200);
        expect(second.body).toEqual({ retiredCount: 0, discountedGames: [] });
        const stillDiscountedOnce = await isolated
          .http()
          .get(`/api/v1/games/${ageing.id}`)
          .expect(200);
        expect(stillDiscountedOnce.body.price).toBe(40);
      } finally {
        await isolated.close();
      }
    });
  });
});
