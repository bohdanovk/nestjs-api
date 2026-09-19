import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

import { exceptionToProblem } from '../problem-details/exception-to-problem.js';
import { PROBLEM_JSON_CONTENT_TYPE } from '../problem-details/problem-details.js';

/**
 * Single exit point for errors: domain errors, Nest HTTP exceptions and unexpected
 * failures are all rendered as RFC 9457 problem details.
 */
const UNAUTHORIZED: number = HttpStatus.UNAUTHORIZED;

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { id?: unknown }>();
    const response = http.getResponse<Response>();

    const { problem, unexpected } = exceptionToProblem(exception, {
      instance: request.originalUrl,
      requestId: typeof request.id === 'string' ? request.id : undefined,
    });

    if (unexpected) {
      this.logger.error(
        { err: exception, requestId: problem.requestId },
        `Unhandled error while processing ${request.method} ${request.originalUrl}`,
      );
    }

    if (problem.status === UNAUTHORIZED) {
      response.setHeader('WWW-Authenticate', 'Bearer');
    }

    response.status(problem.status).type(PROBLEM_JSON_CONTENT_TYPE).send(problem);
  }
}
