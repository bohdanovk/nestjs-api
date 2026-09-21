import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { titleForStatus } from '../problem-details/exception-to-problem.js';
import { problemDetailsSchema } from '../problem-details/problem-details.js';

/**
 * Documents one or more error responses as RFC 9457 problem details.
 * Every operation gets 429 and 500 documented for free.
 */
export function ApiProblemResponses(
  ...statuses: readonly HttpStatus[]
): MethodDecorator & ClassDecorator {
  const all = [
    ...new Set([...statuses, HttpStatus.TOO_MANY_REQUESTS, HttpStatus.INTERNAL_SERVER_ERROR]),
  ];
  return applyDecorators(
    ...all.map((status) =>
      ApiResponse({
        status,
        description: titleForStatus(status),
        standardSchema: problemDetailsSchema,
        content: { 'application/problem+json': {} },
      }),
    ),
  );
}
