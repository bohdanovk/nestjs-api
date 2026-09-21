import { describe, expect, it } from 'vitest';

import { ConfigValidationError, loadConfig } from './load-config.js';

const VALID = {
  MONGODB_URI: 'mongodb://localhost:27017/test',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('loadConfig', () => {
  it('applies sensible defaults', () => {
    const config = loadConfig(VALID);

    expect(config.app).toMatchObject({
      env: 'development',
      port: 3000,
      corsOrigins: [],
      trustProxy: false,
      swaggerEnabled: true,
      logLevel: 'debug',
    });
    expect(config.auth).toMatchObject({ accessTokenTtl: '15m', refreshTokenTtl: '7d' });
    expect(config.auth.bootstrapAdmin).toBeNull();
    expect(config.throttle).toEqual({ ttlSeconds: 60, limit: 100 });
    expect(config.isProduction).toBe(false);
  });

  it('parses and coerces values', () => {
    const config = loadConfig({
      ...VALID,
      NODE_ENV: 'production',
      PORT: '8080',
      CORS_ORIGINS: ' https://a.example , https://b.example ',
      TRUST_PROXY: 'yes',
      AUTH_BOOTSTRAP_ADMIN_EMAIL: 'admin@example.com',
      AUTH_BOOTSTRAP_ADMIN_PASSWORD: 'a strong admin password',
    });

    expect(config.app.port).toBe(8080);
    expect(config.app.corsOrigins).toEqual(['https://a.example', 'https://b.example']);
    expect(config.app.trustProxy).toBe(true);
    expect(config.app.swaggerEnabled).toBe(false);
    expect(config.app.logLevel).toBe('info');
    expect(config.auth.bootstrapAdmin).toEqual({
      email: 'admin@example.com',
      password: 'a strong admin password',
    });
    expect(Object.isFrozen(config.auth)).toBe(true);
  });

  it('reports every invalid variable at once', () => {
    const invalid = {
      MONGODB_URI: 'http://nope',
      JWT_ACCESS_SECRET: 'short',
      JWT_ACCESS_TTL: '15',
    };

    const error = captureError(() => loadConfig(invalid));

    expect(error).toBeInstanceOf(ConfigValidationError);
    const issues = (error as ConfigValidationError).issues.join('\n');
    expect(issues).toContain('MONGODB_URI');
    expect(issues).toContain('JWT_ACCESS_SECRET');
    expect(issues).toContain('JWT_REFRESH_SECRET');
    expect(issues).toContain('JWT_ACCESS_TTL');
  });
});

function captureError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return undefined;
}
