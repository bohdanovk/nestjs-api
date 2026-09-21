import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module.js';
import { configureApp, DOCS_PATH, setupSwagger } from './app.setup.js';
import { AppConfig } from './config/index.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(AppConfig);

  configureApp(app, config);
  if (config.app.swaggerEnabled) {
    setupSwagger(app);
  }

  await app.listen(config.app.port);

  const logger = new Logger('Bootstrap');
  logger.log(`Listening on http://localhost:${config.app.port} (${config.app.env})`);
  if (config.app.swaggerEnabled) {
    logger.log(`API docs at http://localhost:${config.app.port}/${DOCS_PATH}`);
  }
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exitCode = 1;
});
