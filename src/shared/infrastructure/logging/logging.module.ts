import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AppConfig } from '../../../config/index.js';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Structured JSON logging with request correlation. Pretty printing is enabled outside
 * production only; secrets and credentials are redacted before they reach the log stream.
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        pinoHttp: {
          level: config.app.logLevel,
          transport:
            config.isProduction || config.isTest
              ? undefined
              : { target: 'pino-pretty', options: { colorize: true, singleLine: true } },
          genReqId: (req: IncomingMessage, res: ServerResponse): string => {
            const incoming = req.headers[REQUEST_ID_HEADER];
            const id =
              typeof incoming === 'string' && incoming.length <= 128 ? incoming : randomUUID();
            res.setHeader(REQUEST_ID_HEADER, id);
            return id;
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              'req.body.password',
              'req.body.refreshToken',
            ],
            censor: '[REDACTED]',
          },
          customProps: () => ({ context: 'HTTP' }),
          autoLogging: {
            ignore: (req: IncomingMessage) => req.url?.startsWith('/health') ?? false,
          },
          quietReqLogger: true,
        },
      }),
    }),
  ],
})
export class LoggingModule {}
