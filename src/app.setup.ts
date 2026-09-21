import type { INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import type { AppConfig } from './config/index.js';

export const API_PREFIX = 'api';
export const API_DEFAULT_VERSION = '1';
export const DOCS_PATH = `${API_PREFIX}/docs`;

/**
 * Applies the HTTP-level configuration shared by the real server and the e2e tests:
 * logging, security headers, CORS, prefix, versioning and graceful shutdown.
 */
export function configureApp(app: NestExpressApplication, config: AppConfig): void {
  app.useLogger(app.get(Logger));
  app.flushLogs();

  app.use(securityHeaders());
  app.disable('x-powered-by');
  app.set('trust proxy', config.app.trustProxy ? 1 : false);
  app.set('query parser', 'simple');

  if (config.app.corsOrigins.length > 0) {
    app.enableCors({
      origin: [...config.app.corsOrigins],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id', 'Retry-After'],
      maxAge: 600,
    });
  }

  app.setGlobalPrefix(API_PREFIX, { exclude: ['health/live', 'health/ready'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_DEFAULT_VERSION });
  app.enableShutdownHooks();
}

/** Strict security headers everywhere; Swagger UI needs inline scripts and styles. */
function securityHeaders(): (req: Request, res: Response, next: NextFunction) => void {
  const strict = helmet();
  const docs = helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
      },
    },
  });
  return (req, res, next) => {
    const middleware = req.path.startsWith(`/${DOCS_PATH}`) ? docs : strict;
    middleware(req, res, next);
  };
}

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Games Catalog API')
      .setDescription(
        'REST API for managing a games catalog and its publishers.\n\n' +
          'Errors are returned as RFC 9457 problem details (`application/problem+json`). ' +
          'Mutating endpoints require a bearer access token obtained from `POST /api/v1/auth/login`.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addTag('Auth', 'Accounts and sessions')
      .addTag('Games', 'Games catalog')
      .addTag('Publishers', 'Game publishers')
      .addTag('Health', 'Probes')
      .build(),
  );

  SwaggerModule.setup(DOCS_PATH, app, document, {
    jsonDocumentUrl: `${DOCS_PATH}/openapi.json`,
    yamlDocumentUrl: `${DOCS_PATH}/openapi.yaml`,
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
  });
}
