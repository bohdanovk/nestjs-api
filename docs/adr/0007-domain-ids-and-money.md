# 7. Domain-generated UUIDs and integer-cent prices

Date: 2026-09-19 · Status: accepted

## Context

Mongo `ObjectId`s leaked into the API (`ParseObjectIdPipe`), SIRET was stored as a JS number
(leading zeros lost), and prices were floats with `price - price / 100 * discount` arithmetic.

## Decision

- Aggregates create their own identity (`EntityId`, UUID v4) before persistence; Mongo stores
  it as the `_id` string. The API validates ids with `z.uuid()`.
- `Price` is a value object holding integer cents with explicit `fromDecimal`/`toDecimal` and
  `discountedBy` rounding to the nearest cent. Single currency is assumed.
- `Siret` is a string value object with a Luhn check; `PhoneNumber` normalises to E.164.

## Consequences

No database-specific types in the domain or the API; money arithmetic is exact.
