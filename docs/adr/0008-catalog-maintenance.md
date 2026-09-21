# 8. Catalog maintenance is an explicit, idempotent admin operation

Date: 2026-09-19 · Status: accepted

## Context

The prototype exposed `PATCH /api/apocalypse`, which deleted games older than 18 months and
cut 20 % off games aged 12–18 months on every call, so repeated calls compounded discounts.

## Decision

`POST /api/v1/games/maintenance` (admin only) runs `CatalogLifecyclePolicy`: retire games
released before `now - 18 months`; discount games released in `[now - 18 months, now - 12 months]`
that have **not** been discounted yet. A game records its `discount` (percentage, appliedAt);
`applyDiscount` refuses a second discount, and an explicit price change via `PUT` clears the
marker. Month arithmetic clamps to month ends.

## Consequences

Safe to run on a schedule or repeatedly. The policy is a pure domain service with unit tests
around every boundary.
