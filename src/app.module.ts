import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppConfig, ConfigModule } from './config/index.js';
import { GamesModule } from './modules/games/index.js';
import { HealthModule } from './modules/health/index.js';
import { AccessTokenGuard, IamModule } from './modules/iam/index.js';
import { PublishersModule } from './modules/publishers/index.js';
import {
  LoggingModule,
  MongoModule,
  SharedInfrastructureModule,
} from './shared/infrastructure/index.js';
import {
  ProblemDetailsFilter,
  RolesGuard,
  StrictSchemaValidationPipe,
} from './shared/presentation/index.js';

/**
 * Composition root. Cross-cutting behaviour is wired here, in execution order:
 * rate limiting -> authentication -> authorisation -> schema validation -> handler.
 */
@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    SharedInfrastructureModule,
    MongoModule,
    ThrottlerModule.forRootAsync({
      imports: [],
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        throttlers: [
          {
            name: 'default',
            ttl: seconds(config.throttle.ttlSeconds),
            limit: config.throttle.limit,
          },
        ],
      }),
    }),
    HealthModule,
    IamModule,
    PublishersModule,
    GamesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useClass: StrictSchemaValidationPipe },
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
  ],
})
export class AppModule {}
