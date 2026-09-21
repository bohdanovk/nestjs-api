import { z } from 'zod';

/**
 * Error response body as defined by RFC 9457 "Problem Details for HTTP APIs".
 * Served with `Content-Type: application/problem+json`.
 */
export const problemDetailsSchema = z
  .object({
    type: z.string().describe('URI reference identifying the problem type'),
    title: z.string().describe('Short, human-readable summary of the problem type'),
    status: z.int().min(100).max(599).describe('HTTP status code'),
    detail: z
      .string()
      .optional()
      .describe('Human-readable explanation specific to this occurrence'),
    instance: z.string().optional().describe('URI of the request that produced the problem'),
    code: z.string().optional().describe('Stable application error code, e.g. GAME_NOT_FOUND'),
    requestId: z.string().optional().describe('Correlation id echoed in the X-Request-Id header'),
    errors: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional()
      .describe('Field-level validation errors'),
  })
  .meta({ id: 'ProblemDetails' });

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;

export const PROBLEM_JSON_CONTENT_TYPE = 'application/problem+json';

export function problemTypeFor(code: string): string {
  return `urn:problem-type:${code.toLowerCase().replaceAll('_', '-')}`;
}
