import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  InvariantViolationError,
  NotFoundError,
} from '../../domain/index.js';
import { exceptionToProblem } from './exception-to-problem.js';

class ThingNotFound extends NotFoundError {
  readonly code = 'THING_NOT_FOUND';
}
class ThingConflict extends ConflictError {
  readonly code = 'THING_CONFLICT';
}
class NotYou extends AuthenticationError {
  readonly code = 'NOT_YOU';
}
class NotAllowed extends AuthorizationError {
  readonly code = 'NOT_ALLOWED';
}

const context = { instance: '/api/v1/things/1', requestId: 'req-1' };

describe('exceptionToProblem', () => {
  it.each([
    [new ThingNotFound('missing'), 404, 'urn:problem-type:thing-not-found'],
    [new ThingConflict('dupe'), 409, 'urn:problem-type:thing-conflict'],
    [new NotYou('who?'), 401, 'urn:problem-type:not-you'],
    [new NotAllowed('no'), 403, 'urn:problem-type:not-allowed'],
    [new InvariantViolationError('bad'), 422, 'urn:problem-type:invariant-violation'],
  ])('maps %s to %i', (error, status, type) => {
    const { problem, unexpected } = exceptionToProblem(error, context);

    expect(unexpected).toBe(false);
    expect(problem).toMatchObject({
      type,
      status,
      detail: error.message,
      code: error.code,
      instance: context.instance,
      requestId: context.requestId,
    });
  });

  it('maps Nest HTTP exceptions and keeps field-level validation errors', () => {
    const validation = new BadRequestException({
      message: 'Request validation failed.',
      errors: [{ path: 'title', message: 'Too short' }],
    });

    expect(exceptionToProblem(validation, context).problem).toMatchObject({
      status: 400,
      title: 'Bad Request',
      detail: 'Request validation failed.',
      errors: [{ path: 'title', message: 'Too short' }],
    });
    expect(
      exceptionToProblem(new NotFoundException('Cannot GET /x'), context).problem,
    ).toMatchObject({ status: 404, detail: 'Cannot GET /x' });
  });

  it('converts array messages from built-in pipes into field errors', () => {
    const { problem } = exceptionToProblem(
      new BadRequestException(['price: expected number', 'nested.deep: required']),
      context,
    );

    expect(problem.errors).toEqual([
      { path: 'price', message: 'expected number' },
      { path: 'nested.deep', message: 'required' },
    ]);
  });

  it('never leaks internals for unexpected errors', () => {
    const { problem, unexpected } = exceptionToProblem(
      new Error('db password is hunter2'),
      context,
    );

    expect(unexpected).toBe(true);
    expect(problem.status).toBe(500);
    expect(JSON.stringify(problem)).not.toContain('hunter2');
  });

  it('flags 5xx HTTP exceptions as unexpected', () => {
    expect(exceptionToProblem(new ServiceUnavailableException(), context).unexpected).toBe(true);
  });
});
