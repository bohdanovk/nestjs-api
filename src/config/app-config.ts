import type { Duration, Env } from './env.schema.js';

export type NodeEnv = Env['NODE_ENV'];
export type LogLevel = NonNullable<Env['LOG_LEVEL']>;

export interface BootstrapAdmin {
  readonly email: string;
  readonly password: string;
}

/**
 * Typed, validated, immutable view of the process configuration.
 * Inject this class instead of reading `process.env`.
 */
export class AppConfig {
  readonly app: {
    readonly env: NodeEnv;
    readonly port: number;
    readonly corsOrigins: readonly string[];
    readonly trustProxy: boolean;
    readonly swaggerEnabled: boolean;
    readonly logLevel: LogLevel;
  };

  readonly database: {
    readonly uri: string;
  };

  readonly auth: {
    readonly accessTokenSecret: string;
    readonly refreshTokenSecret: string;
    readonly accessTokenTtl: Duration;
    readonly refreshTokenTtl: Duration;
    readonly bootstrapAdmin: BootstrapAdmin | null;
  };

  readonly throttle: {
    readonly ttlSeconds: number;
    readonly limit: number;
  };

  constructor(env: Env) {
    const isProduction = env.NODE_ENV === 'production';

    this.app = {
      env: env.NODE_ENV,
      port: env.PORT,
      corsOrigins: env.CORS_ORIGINS,
      trustProxy: env.TRUST_PROXY,
      swaggerEnabled: env.SWAGGER_ENABLED ?? !isProduction,
      logLevel: env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    };
    this.database = { uri: env.MONGODB_URI };
    this.auth = {
      accessTokenSecret: env.JWT_ACCESS_SECRET,
      refreshTokenSecret: env.JWT_REFRESH_SECRET,
      accessTokenTtl: env.JWT_ACCESS_TTL,
      refreshTokenTtl: env.JWT_REFRESH_TTL,
      bootstrapAdmin:
        env.AUTH_BOOTSTRAP_ADMIN_EMAIL !== undefined &&
        env.AUTH_BOOTSTRAP_ADMIN_PASSWORD !== undefined
          ? { email: env.AUTH_BOOTSTRAP_ADMIN_EMAIL, password: env.AUTH_BOOTSTRAP_ADMIN_PASSWORD }
          : null,
    };
    this.throttle = { ttlSeconds: env.THROTTLE_TTL_SECONDS, limit: env.THROTTLE_LIMIT };

    Object.freeze(this.app);
    Object.freeze(this.database);
    Object.freeze(this.auth);
    Object.freeze(this.throttle);
    Object.freeze(this);
  }

  get isProduction(): boolean {
    return this.app.env === 'production';
  }

  get isTest(): boolean {
    return this.app.env === 'test';
  }
}
