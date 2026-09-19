import { randomUUID } from 'node:crypto';

import { ADMIN_CREDENTIALS, type TestApp } from './test-app.js';

export interface Session {
  readonly email: string;
  readonly password: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly bearer: string;
}

export async function login(app: TestApp, email: string, password: string): Promise<Session> {
  const response = await app
    .http()
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  const { accessToken, refreshToken } = response.body as {
    accessToken: string;
    refreshToken: string;
  };
  return { email, password, accessToken, refreshToken, bearer: `Bearer ${accessToken}` };
}

/** Registers a fresh regular user and logs in. */
export async function registerAndLogin(app: TestApp): Promise<Session> {
  const email = `user-${randomUUID()}@example.com`;
  const password = 'a perfectly fine password';
  await app.http().post('/api/v1/auth/register').send({ email, password }).expect(201);
  return login(app, email, password);
}

export function loginAsAdmin(app: TestApp): Promise<Session> {
  return login(app, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
}
