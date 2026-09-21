import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthCheckResult } from '@nestjs/terminus';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '../../../shared/presentation/index.js';

const DATABASE_PING_TIMEOUT_MS = 1_500;

/** Liveness and readiness probes; served outside the API prefix and versioning. */
@ApiTags('Health')
@Public()
@SkipThrottle()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe', description: 'The process is up.' })
  @ApiOkResponse({
    schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } },
  })
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe', description: 'The process can serve traffic.' })
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      this.mongoose.pingCheck('mongodb').withTimeout(DATABASE_PING_TIMEOUT_MS),
    ]);
  }
}
