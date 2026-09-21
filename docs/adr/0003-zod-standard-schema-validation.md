# 3. Zod schemas as the HTTP contract (validation + OpenAPI)

Date: 2026-09-19 · Status: accepted

## Context

The prototype used class-validator DTO classes duplicated for create/update, a hand-written
validation pipe, and Swagger decorators repeated on Mongoose schema classes. NestJS 12 added
native Standard Schema support (`@Body({ schema })`, `StandardSchemaValidationPipe`) and
`@nestjs/swagger` 12 converts Standard JSON Schema into OpenAPI.

## Decision

Request and response contracts are Zod v4 schemas in each module's `presentation` layer.
They are attached to parameter decorators for validation and to `@ApiOkResponse({ standardSchema })`
for documentation. `StrictSchemaValidationPipe` fails closed when a body/query/param has no schema.
class-validator and class-transformer were removed.

## Consequences

One source of truth for shape, types (`z.infer`) and docs. Domain invariants still live in
value objects; Zod covers cheap structural checks. Response presenters are contract-tested
against their schema.
