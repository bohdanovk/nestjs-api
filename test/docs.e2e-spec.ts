import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp, type TestApp } from './helpers/test-app.js';

describe('API documentation', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app.close());

  it('serves the OpenAPI document generated from the Zod schemas', async () => {
    const response = await app.http().get('/api/docs/openapi.json').expect(200);
    const document = response.body as {
      paths: Record<string, Record<string, { responses: Record<string, unknown> }>>;
      components: { schemas: Record<string, unknown>; securitySchemes: Record<string, unknown> };
    };

    expect(Object.keys(document.paths)).toEqual(
      expect.arrayContaining([
        '/api/v1/games',
        '/api/v1/games/{id}',
        '/api/v1/games/{id}/publisher',
        '/api/v1/games/maintenance',
        '/api/v1/publishers',
        '/api/v1/publishers/{id}',
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/v1/auth/refresh',
        '/api/v1/auth/logout',
        '/api/v1/auth/me',
        '/health/live',
        '/health/ready',
      ]),
    );
    expect(Object.keys(document.components.schemas)).toEqual(
      expect.arrayContaining([
        'Game',
        'GameInput',
        'GamePage',
        'Publisher',
        'PublisherInput',
        'ProblemDetails',
        'AuthTokens',
        'User',
      ]),
    );
    expect(document.components.securitySchemes).toHaveProperty('bearer');

    const createGame = document.paths['/api/v1/games']?.post;
    expect(createGame?.responses).toHaveProperty('201');
    expect(createGame?.responses).toHaveProperty('401');
    expect(createGame?.responses).toHaveProperty('422');
    expect(JSON.stringify(createGame)).toContain('GameInput');
  });

  it('serves the Swagger UI with a relaxed content security policy', async () => {
    const response = await app.http().get('/api/docs').expect(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.headers['content-security-policy']).toContain("'unsafe-inline'");
  });
});
