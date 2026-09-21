import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { z } from 'zod';

import { AppConfig } from './app-config.js';
import { envSchema } from './env.schema.js';

export class ConfigValidationError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`Invalid environment configuration:\n  - ${issues.join('\n  - ')}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Loads `.env` (if present, without overriding variables already set in the environment),
 * validates `process.env` against the schema and returns a typed AppConfig.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const envFile = resolve(process.cwd(), '.env');
  if (env === process.env && env.NODE_ENV !== 'test' && existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }

  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (issue) => `${issue.path.map(String).join('.') || '<root>'}: ${issue.message}`,
    );
    throw new ConfigValidationError(issues);
  }

  return new AppConfig(parsed.data);
}

/** Convenience for tests and tooling that already hold a raw env object. */
export function parseEnv(env: Record<string, string | undefined>): z.infer<typeof envSchema> {
  return envSchema.parse(env);
}
