import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import type { ESLint, Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/* -------------------------------------------------------------------------------------------------
 * Architecture boundaries (eslint-plugin-boundaries)
 *
 * Elements are folders (first matching descriptor wins):
 *   src/modules/<module>/<layer>/**   -> module-layer   captured { module, layer }
 *                                        layer: domain | application | infrastructure | presentation | testing
 *   src/modules/<module>/*.ts         -> module-root    captured { module }   (index.ts + <name>.module.ts)
 *   src/shared/<layer>/**             -> shared         captured { layer }
 *   src/config/**                     -> config
 *   src/*.ts                          -> app            composition root (main, app.module, app.setup)
 *
 * File categories (orthogonal to elements):
 *   src/modules/<module>/index.ts     -> module-api     the ONLY file other modules may import
 *   src/** /*.spec.ts                  -> spec           may import anything
 *
 * Dependency direction inside a bounded context:  presentation -> application -> domain <- infrastructure
 * The full rationale lives in docs/architecture.md.
 * ----------------------------------------------------------------------------------------------- */

const shared = (layer: string) => ({ element: { type: 'shared', captured: { layer } } });
const layer = (layerName: string) => ({
  element: { type: 'module-layer', captured: { layer: layerName } },
});
const own = (layerName: string) => ({
  element: {
    type: 'module-layer',
    captured: { module: '{{ from.element.captured.module }}', layer: layerName },
  },
});
const ownLayers = {
  element: { type: 'module-layer', captured: { module: '{{ from.element.captured.module }}' } },
};
const ownRoot = {
  element: { type: 'module-root', captured: { module: '{{ from.element.captured.module }}' } },
};
/** Another module's `index.ts`. */
const foreignApi = {
  element: { type: 'module-root', captured: { module: '!{{ from.element.captured.module }}' } },
  file: { categories: 'module-api' },
};
const anyApi = { element: { type: 'module-root' }, file: { categories: 'module-api' } };
const config = { element: { type: 'config' } };
const external = (source: string) => ({ module: { origin: 'external', source } });

const FRAMEWORK_PACKAGES = [
  '@nestjs/*',
  'mongoose',
  'express',
  'zod',
  'argon2',
  'helmet',
  'pino',
  'pino-http',
  'nestjs-pino',
];

const boundariesSettings = {
  'boundaries/root-path': import.meta.dirname,
  'boundaries/include': ['src/**/*.ts'],
  'boundaries/elements': [
    {
      type: 'module-layer',
      pattern: 'src/modules/*/*',
      capture: ['module', 'layer'],
      partialMatch: false,
    },
    { type: 'module-root', pattern: 'src/modules/*', capture: ['module'], partialMatch: false },
    { type: 'shared', pattern: 'src/shared/*', capture: ['layer'], partialMatch: false },
    { type: 'config', pattern: 'src/config', partialMatch: false },
    { type: 'app', pattern: 'src', partialMatch: false },
  ],
  'boundaries/files': [
    { pattern: 'src/modules/*/index.ts', category: 'module-api' },
    { pattern: 'src/**/*.spec.ts', category: 'spec' },
  ],
};

const boundariesRules: Linter.RulesRecord = {
  'boundaries/no-unknown-files': 'error',
  'boundaries/no-unknown-dependencies': 'error',
  'boundaries/dependencies': [
    'error',
    {
      default: 'disallow',
      checkAllOrigins: true,
      message:
        '{{ from.element.types.[0] }}{{#if from.element.captured.layer }} ({{ from.element.captured.layer }}){{/if}} ' +
        'must not depend on {{#if to.module.source }}"{{ to.module.source }}"{{else}}{{ to.element.types.[0] }}{{#if to.element.captured.layer }} ({{ to.element.captured.layer }}){{/if}}{{/if}}. ' +
        'See docs/architecture.md.',
      policies: [
        // ---- Third-party & core modules: allowed everywhere, then restricted per layer below.
        { allow: { to: { module: { origin: 'external' } } } },
        { allow: { to: { module: { origin: 'core' } } } },
        {
          from: [shared('domain'), layer('domain')],
          disallow: { to: FRAMEWORK_PACKAGES.map(external) },
          message:
            'The domain layer must stay framework-free: "{{ to.module.source }}" is not allowed here.',
        },
        {
          from: [shared('application'), layer('application')],
          disallow: {
            to: [
              '@nestjs/mongoose',
              '@nestjs/swagger',
              '@nestjs/platform-express',
              '@nestjs/core',
              'mongoose',
              'express',
              'argon2',
              'helmet',
            ].map(external),
          },
          message:
            'The application layer must not depend on I/O or transport libraries ("{{ to.module.source }}").',
        },
        {
          from: [shared('presentation'), layer('presentation')],
          disallow: { to: ['@nestjs/mongoose', 'mongoose', 'argon2'].map(external) },
          message:
            'The presentation layer must not talk to persistence ("{{ to.module.source }}").',
        },

        // ---- Composition root and configuration.
        {
          from: { element: { type: 'app' } },
          allow: {
            to: [{ element: { type: 'app' } }, config, { element: { type: 'shared' } }, anyApi],
          },
        },
        { from: config, allow: { to: [config, shared('domain')] } },

        // ---- Shared kernel layering.
        { from: shared('domain'), allow: { to: shared('domain') } },
        { from: shared('application'), allow: { to: [shared('domain'), shared('application')] } },
        {
          from: shared('infrastructure'),
          allow: {
            to: [config, shared('domain'), shared('application'), shared('infrastructure')],
          },
        },
        {
          from: shared('presentation'),
          allow: { to: [config, shared('domain'), shared('application'), shared('presentation')] },
        },

        // ---- Bounded-context layering. Cross-module access goes through `index.ts` only.
        { from: layer('domain'), allow: { to: [shared('domain'), own('domain')] } },
        {
          from: layer('application'),
          allow: {
            to: [
              shared('domain'),
              shared('application'),
              own('domain'),
              own('application'),
              foreignApi,
            ],
          },
        },
        {
          from: layer('infrastructure'),
          allow: {
            to: [
              config,
              shared('domain'),
              shared('application'),
              shared('infrastructure'),
              own('domain'),
              own('application'),
              own('infrastructure'),
              foreignApi,
            ],
          },
        },
        {
          from: layer('presentation'),
          allow: {
            to: [
              config,
              shared('domain'),
              shared('application'),
              shared('presentation'),
              own('domain'),
              own('application'),
              own('presentation'),
              foreignApi,
            ],
          },
        },
        {
          from: layer('testing'),
          allow: { to: [shared('domain'), shared('application'), ownLayers] },
        },
        {
          from: { element: { type: 'module-root' } },
          allow: {
            to: [config, { element: { type: 'shared' } }, ownLayers, ownRoot, foreignApi],
          },
        },

        // ---- Tests may import anything (evaluated last so it overrides the layer policies).
        { from: { file: { categories: 'spec' } }, allow: { to: { module: { origin: 'local' } } } },
      ],
    },
  ],
};

export default defineConfig(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  security.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
    },
    rules: {
      'no-console': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use `as const` objects with union types instead of enums.',
        },
      ],

      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public', overrides: { parameterProperties: 'off' } },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],

      // Almost entirely false positives in typed code.
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries: boundaries as unknown as ESLint.Plugin },
    settings: boundariesSettings,
    rules: boundariesRules,
  },
  {
    // The application layer may use Nest only for dependency-injection metadata.
    files: ['src/shared/application/**/*.ts', 'src/modules/*/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@nestjs/common',
              allowImportNames: ['Injectable', 'Inject', 'Optional'],
              message: 'Application layer may only import DI decorators from @nestjs/common.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', '**.expect'] }],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  prettier,
);
