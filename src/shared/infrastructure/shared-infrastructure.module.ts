import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { EVENT_PUBLISHER } from '../application/index.js';
import { CLOCK } from '../domain/index.js';
import { SystemClock } from './clock/system-clock.js';
import { NestEventPublisher } from './events/nest-event-publisher.js';

/** Cross-cutting adapters for the ports declared in the shared kernel. */
@Global()
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: false, verboseMemoryLeak: true })],
  providers: [
    { provide: CLOCK, useClass: SystemClock },
    { provide: EVENT_PUBLISHER, useClass: NestEventPublisher },
  ],
  exports: [CLOCK, EVENT_PUBLISHER],
})
export class SharedInfrastructureModule {}
