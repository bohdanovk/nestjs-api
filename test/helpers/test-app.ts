import 'reflect-metadata';

import { randomUUID } from 'node:crypto';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import mongoose from 'mongoose';
import request from 'supertest';
import { inject } from 'vitest';

import { AppModule } from '../../src/app.module.js';
import { configureApp, setupSwagger } from '../../src/app.setup.js';
import { AppConfig } from '../../src/config/index.js';

export const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin-bootstrap-password',
} as const;

export interface TestApp {
  readonly app: NestExpressApplication;
  readonly http: () => ReturnType<typeof request>;
  readonly close: () => Promise<void>;
}

/**
 * Boots the full application against an isolated database of the shared in-memory MongoDB.
 * The same HTTP configuration as production is applied (prefix, versioning, filters, guards).
 */
export async function createTestApp(): Promise<TestApp> {
  const databaseName = `e2e_${randomUUID().replaceAll('-', '')}`;
  const mongoUri = new URL(inject('mongoUri'));
  mongoUri.pathname = `/${databaseName}`;

  Object.assign(process.env, {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    MONGODB_URI: mongoUri.toString(),
    JWT_ACCESS_SECRET: 'test-access-secret-that-is-long-enough-123456',
    JWT_REFRESH_SECRET: 'test-refresh-secret-that-is-long-enough-12345',
    JWT_ACCESS_TTL: '15m',
    JWT_REFRESH_TTL: '7d',
    AUTH_BOOTSTRAP_ADMIN_EMAIL: ADMIN_CREDENTIALS.email,
    AUTH_BOOTSTRAP_ADMIN_PASSWORD: ADMIN_CREDENTIALS.password,
    TRUST_PROXY: 'true',
    THROTTLE_TTL_SECONDS: '60',
    THROTTLE_LIMIT: '1000',
    SWAGGER_ENABLED: 'true',
  });

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ bufferLogs: true });
  configureApp(app, app.get(AppConfig));
  setupSwagger(app);
  await app.init();

  return {
    app,
    http: () => request(app.getHttpServer()),
    close: async () => {
      await app.close();
      const connection = await mongoose.createConnection(mongoUri.toString()).asPromise();
      await connection.dropDatabase();
      await connection.close();
    },
  };
}
