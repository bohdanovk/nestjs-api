import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const swcPlugin = swc.vite({
  jsc: {
    target: 'es2024',
    parser: { syntax: 'typescript', decorators: true },
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
      useDefineForClassFields: false,
    },
    keepClassNames: true,
  },
  module: { type: 'es6' },
});

export default defineConfig({
  plugins: [swcPlugin],
  test: {
    environment: 'node',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['test/**/*.e2e-spec.ts'],
          globalSetup: ['test/setup/global-setup.ts'],
          testTimeout: 30_000,
          hookTimeout: 60_000,
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/**/*.spec.ts',
        'src/**/index.ts',
        'src/**/*.module.ts',
        'src/**/testing/**',
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
