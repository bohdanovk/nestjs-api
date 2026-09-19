# 2. Bounded contexts with four enforced layers

Date: 2026-09-19 · Status: accepted

## Context

The original layout (`api/games/{controller,service,schema}`) mixed HTTP, business rules and
Mongoose in "services"; Mongoose documents leaked into controllers and cross-module code
imported other modules' services and schemas directly.

## Decision

Each business capability is a module under `src/modules/<name>/` with `domain`,
`application`, `infrastructure` and `presentation` layers plus an `index.ts` public API.
Dependency direction is enforced by `eslint-plugin-boundaries` (see `eslint.config.ts`), and
the domain layer is forbidden from importing frameworks. Cross-module collaboration happens
through exported ports (`PublisherLookup`) and domain events (`PublisherDeletedEvent`).

## Consequences

More files per feature, but each one has a single reason to change and can be tested in
isolation. Architectural drift is caught by `pnpm lint`. A module could be extracted into its
own service by replacing the in-process event bus and port adapters.
