# 6. JWT access tokens + rotating refresh tokens, no Passport

Date: 2026-09-19 · Status: accepted

## Context

The API had no authentication; anyone could mutate or wipe the catalog.

## Decision

- Accounts with Argon2id-hashed passwords (OWASP parameters); minimum 12-character passwords.
- Short-lived HS256 access tokens (`aud: access`) verified statelessly by a global guard;
  routes opt out with `@Public()`, roles are enforced with `@Roles()`.
- Refresh tokens (`aud: refresh`) carry a `jti` that is stored on the user. Refreshing rotates
  the id, so the previous token is rejected; logout clears it.
- Separate secrets for the two token kinds, validated to be ≥ 32 characters at start-up.
- Rate limiting: 100 req/min per IP globally, 10 req/min on credential endpoints.
- An initial admin is created from `AUTH_BOOTSTRAP_ADMIN_*` on first boot (idempotent).
- `@nestjs/jwt` is used directly; Passport adds nothing for bearer tokens.

## Consequences

Public reads, authenticated writes, admin-only maintenance. Revocation is immediate for refresh
tokens and bounded by the 15-minute TTL for access tokens (acceptable for this API; a token
denylist could be added behind the `TokenService` port if required).
