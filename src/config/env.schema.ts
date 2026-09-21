import { z } from 'zod';

const booleanString = z
  .string()
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.enum(['true', 'false', '1', '0', 'yes', 'no']))
  .transform((value) => value === 'true' || value === '1' || value === 'yes');

const commaSeparatedList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  );

export type DurationUnit = 'ms' | 's' | 'm' | 'h' | 'd';

/** Human-readable duration accepted by `jsonwebtoken` and parsed by `durationToSeconds`. */
export type Duration = `${number}${DurationUnit}`;

const DURATION_PATTERN = /^\d+(ms|s|m|h|d)$/;

const duration = z
  .string()
  .regex(DURATION_PATTERN, 'expected a duration such as 15m, 12h or 7d')
  .transform((value) => value as Duration);

const secret = z.string().min(32, 'must be at least 32 characters long');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  CORS_ORIGINS: commaSeparatedList,
  TRUST_PROXY: booleanString.default(false),
  SWAGGER_ENABLED: booleanString.optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),

  MONGODB_URI: z.url({ protocol: /^mongodb(\+srv)?$/ }),

  JWT_ACCESS_SECRET: secret,
  JWT_REFRESH_SECRET: secret,
  JWT_ACCESS_TTL: duration.default('15m'),
  JWT_REFRESH_TTL: duration.default('7d'),
  AUTH_BOOTSTRAP_ADMIN_EMAIL: z.email().optional(),
  AUTH_BOOTSTRAP_ADMIN_PASSWORD: z.string().min(12).optional(),

  THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;
