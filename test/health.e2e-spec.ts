import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp, type TestApp } from './helpers/test-app.js';

describe('health', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app.close());

  it('GET /health/live answers without authentication or API prefix', async () => {
    const response = await app.http().get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /health/ready reports the database as up', async () => {
    const response = await app.http().get('/health/ready').expect(200);
    expect(response.body).toMatchObject({ status: 'ok', details: { mongodb: { status: 'up' } } });
  });

  it('sends security headers and a request id', async () => {
    const response = await app.http().get('/health/live').set('X-Request-Id', 'abc-123');
    expect(response.headers['x-request-id']).toBe('abc-123');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('renders unknown routes as problem details', async () => {
    const response = await app.http().get('/api/v1/nope').expect(404);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({
      status: 404,
      title: 'Not Found',
      instance: '/api/v1/nope',
    });
    expect(response.body.requestId).toEqual(expect.any(String));
  });
});
