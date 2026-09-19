import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { login, loginAsAdmin, registerAndLogin } from './helpers/auth.js';
import { createTestApp, type TestApp } from './helpers/test-app.js';

describe('auth', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app.close());

  describe('POST /api/v1/auth/register', () => {
    it('creates a user account', async () => {
      const email = `new-${randomUUID()}@example.com`;
      const response = await app
        .http()
        .post('/api/v1/auth/register')
        .send({ email, password: 'a perfectly fine password' })
        .expect(201);

      expect(response.body).toMatchObject({ email, role: 'user' });
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('rejects duplicate e-mail addresses with 409', async () => {
      const session = await registerAndLogin(app);
      const response = await app
        .http()
        .post('/api/v1/auth/register')
        .send({ email: session.email.toUpperCase(), password: 'another long password' })
        .expect(409);

      expect(response.body).toMatchObject({ status: 409, code: 'EMAIL_ALREADY_REGISTERED' });
    });

    it('validates the payload with field-level errors', async () => {
      const response = await app
        .http()
        .post('/api/v1/auth/register')
        .send({ email: 'nope', password: 'short', extra: true })
        .expect(400);

      expect(response.headers['content-type']).toContain('application/problem+json');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'email' }),
          expect.objectContaining({ path: 'password' }),
          expect.objectContaining({ path: '' }),
        ]),
      );
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns bearer tokens', async () => {
      const session = await registerAndLogin(app);
      expect(session.accessToken.split('.')).toHaveLength(3);
      expect(session.refreshToken.split('.')).toHaveLength(3);
    });

    it('rejects bad credentials with 401 and no hint about the account', async () => {
      const session = await registerAndLogin(app);
      const wrongPassword = await app
        .http()
        .post('/api/v1/auth/login')
        .send({ email: session.email, password: 'wrong password!' })
        .expect(401);
      const unknownUser = await app
        .http()
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@example.com', password: 'wrong password!' })
        .expect(401);

      expect(wrongPassword.body.code).toBe('INVALID_CREDENTIALS');
      expect(unknownUser.body.detail).toBe(wrongPassword.body.detail);
      expect(wrongPassword.headers['www-authenticate']).toBe('Bearer');
    });

    it('is rate limited', async () => {
      const email = `limited-${randomUUID()}@example.com`;
      let lastStatus = 0;
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const response = await app
          .http()
          .post('/api/v1/auth/login')
          .set('X-Forwarded-For', '203.0.113.7')
          .send({ email, password: 'wrong password!' });
        lastStatus = response.status;
        if (lastStatus === 429) break;
      }
      expect(lastStatus).toBe(429);
    });
  });

  describe('token lifecycle', () => {
    it('GET /auth/me identifies the caller', async () => {
      const session = await registerAndLogin(app);
      const response = await app
        .http()
        .get('/api/v1/auth/me')
        .set('Authorization', session.bearer)
        .expect(200);

      expect(response.body).toMatchObject({ email: session.email, role: 'user' });
    });

    it('rejects missing, malformed and forged access tokens', async () => {
      await app.http().get('/api/v1/auth/me').expect(401);
      await app.http().get('/api/v1/auth/me').set('Authorization', 'Basic abc').expect(401);
      const forged = await app
        .http()
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.invalid')
        .expect(401);
      expect(forged.body.code).toBe('INVALID_ACCESS_TOKEN');
    });

    it('rotates refresh tokens and revokes them on logout', async () => {
      const session = await registerAndLogin(app);

      const refreshed = await app
        .http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(200);
      expect(refreshed.body.refreshToken).not.toBe(session.refreshToken);

      await app
        .http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(401);

      await app
        .http()
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${refreshed.body.accessToken as string}`)
        .expect(204);

      await app
        .http()
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: refreshed.body.refreshToken as string })
        .expect(401);
    });

    it('bootstraps the admin account from configuration', async () => {
      const admin = await loginAsAdmin(app);
      const response = await app
        .http()
        .get('/api/v1/auth/me')
        .set('Authorization', admin.bearer)
        .expect(200);
      expect(response.body.role).toBe('admin');
      await expect(login(app, admin.email, 'not the password')).rejects.toThrow();
    });
  });
});
