# 4. Native ESM, SWC build, Vitest, ESLint flat config, pnpm

Date: 2026-09-19 · Status: accepted

## Context

NestJS 12 ships as ESM only. The old toolchain (CommonJS, ts-jest, ESLint 8 legacy config,
npm, Node 12 image) no longer matches the ecosystem.

## Decision

- Node 24 (`.nvmrc`, `engines`), pnpm with `minimumReleaseAge` and opt-in build scripts.
- `"type": "module"`, `module: NodeNext`, explicit `.js` import extensions.
- SWC for transpilation (`nest build`/`nest start`), `tsc --noEmit` for type checking.
- Vitest 5 with `unplugin-swc` for decorator metadata; `mongodb-memory-server` for e2e.
- ESLint 10 flat config (`eslint.config.ts`) with typed rules, Prettier 3, Husky + lint-staged +
  commitlint (Conventional Commits).
- TypeScript 6.0 (typescript-eslint and the Nest CLI do not support 7 yet).

## Consequences

Fast builds and tests; strict typing (`strict`, `noUncheckedIndexedAccess`). Contributors need
Node ≥ 24 and pnpm. Enums are banned in favour of `as const` unions.
