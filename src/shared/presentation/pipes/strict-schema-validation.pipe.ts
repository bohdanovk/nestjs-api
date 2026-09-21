import type { ArgumentMetadata } from '@nestjs/common';
import { BadRequestException, Injectable, StandardSchemaValidationPipe } from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Validates every `@Body()`, `@Query()` and `@Param()` against the Standard Schema
 * attached to the decorator, and fails closed: a route parameter without a schema is a
 * programming error, not an opportunity to accept unvalidated input.
 */
@Injectable()
export class StrictSchemaValidationPipe extends StandardSchemaValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (issues) => new BadRequestException(toValidationBody(issues)),
    });
  }

  override async transform<T = unknown>(value: T, metadata: ArgumentMetadata): Promise<T> {
    if (metadata.schema === undefined && metadata.type !== 'custom') {
      const name = metadata.data === undefined ? '' : ` "${metadata.data}"`;
      throw new Error(
        `Unvalidated ${metadata.type} parameter${name}: attach a schema to the decorator`,
      );
    }
    return super.transform(value, metadata);
  }
}

function toValidationBody(issues: readonly StandardSchemaV1.Issue[]): {
  message: string;
  errors: { path: string; message: string }[];
} {
  return {
    message: 'Request validation failed.',
    errors: issues.map((issue) => ({
      path: (issue.path ?? [])
        .map((segment) => (typeof segment === 'object' ? String(segment.key) : String(segment)))
        .join('.'),
      message: issue.message,
    })),
  };
}
