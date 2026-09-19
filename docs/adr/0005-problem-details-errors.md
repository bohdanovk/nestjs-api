# 5. RFC 9457 problem details for every error

Date: 2026-09-19 · Status: accepted

## Context

Controllers threw `NotFoundException` ad hoc and validation errors were a bespoke string list.
Clients had no stable machine-readable error format.

## Decision

Domain and application code throw typed `DomainError`s. A single global
`ProblemDetailsFilter` renders any exception as `application/problem+json` with `type`,
`title`, `status`, `detail`, `instance`, a stable `code` for domain errors, the request id,
and field-level `errors` for validation failures. 5xx responses never expose internals.

## Consequences

Controllers contain no error-mapping code. Error contracts are documented once
(`ProblemDetails` schema) and reused by every operation via `@ApiProblemResponses`.
