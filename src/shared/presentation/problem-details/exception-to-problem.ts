import { HttpException, HttpStatus } from '@nestjs/common';

import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DomainError,
  InvariantViolationError,
  NotFoundError,
} from '../../domain/index.js';
import type { ProblemDetails } from './problem-details.js';
import { problemTypeFor } from './problem-details.js';

const STATUS_TITLES: Readonly<Record<number, string>> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  409: 'Conflict',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Content',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

export interface ProblemContext {
  readonly instance: string;
  readonly requestId?: string;
}

export interface ProblemTranslation {
  readonly problem: ProblemDetails;
  /** True when the error was not anticipated and should be logged with its stack. */
  readonly unexpected: boolean;
}

export function titleForStatus(status: number): string {
  return STATUS_TITLES[status] ?? 'Error';
}

export function domainErrorStatus(error: DomainError): number {
  if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND;
  if (error instanceof ConflictError) return HttpStatus.CONFLICT;
  if (error instanceof AuthenticationError) return HttpStatus.UNAUTHORIZED;
  if (error instanceof AuthorizationError) return HttpStatus.FORBIDDEN;
  if (error instanceof InvariantViolationError) return HttpStatus.UNPROCESSABLE_ENTITY;
  return HttpStatus.UNPROCESSABLE_ENTITY;
}

/** Translates any thrown value into an RFC 9457 problem. Never leaks internals for 5xx. */
export function exceptionToProblem(
  exception: unknown,
  context: ProblemContext,
): ProblemTranslation {
  if (exception instanceof DomainError) {
    const status = domainErrorStatus(exception);
    return {
      unexpected: false,
      problem: {
        type: problemTypeFor(exception.code),
        title: titleForStatus(status),
        status,
        detail: exception.message,
        code: exception.code,
        ...context,
      },
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const body = exception.getResponse();
    const { detail, errors } = extractHttpExceptionBody(body, exception.message);
    return {
      unexpected: status >= 500,
      problem: {
        type: 'about:blank',
        title: titleForStatus(status),
        status,
        detail,
        ...(errors ? { errors } : {}),
        ...context,
      },
    };
  }

  return {
    unexpected: true,
    problem: {
      type: 'about:blank',
      title: titleForStatus(HttpStatus.INTERNAL_SERVER_ERROR),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'An unexpected error occurred.',
      ...context,
    },
  };
}

interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

function extractHttpExceptionBody(
  body: string | object,
  fallback: string,
): { detail: string; errors?: ValidationIssue[] } {
  if (typeof body === 'string') return { detail: body };

  const record = body as { message?: unknown; errors?: unknown };
  const errors = Array.isArray(record.errors) ? record.errors.filter(isValidationIssue) : undefined;

  if (Array.isArray(record.message)) {
    const messages = record.message.filter((item): item is string => typeof item === 'string');
    return {
      detail: 'Request validation failed.',
      errors: errors ?? messages.map(toValidationIssue),
    };
  }

  const detail = typeof record.message === 'string' ? record.message : fallback;
  return errors ? { detail, errors } : { detail };
}

function isValidationIssue(value: unknown): value is ValidationIssue {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ValidationIssue).path === 'string' &&
    typeof (value as ValidationIssue).message === 'string'
  );
}

/** Nest's default pipe messages look like `field: message`; split them back apart. */
function toValidationIssue(message: string): ValidationIssue {
  const separator = message.indexOf(': ');
  if (separator === -1) return { path: '', message };
  return { path: message.slice(0, separator), message: message.slice(separator + 2) };
}
