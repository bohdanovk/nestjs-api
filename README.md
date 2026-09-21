# Games Catalog API

A production-shaped REST API for a games catalog and its publishers, built with **NestJS 12**
and **Domain-Driven Design**. It exists to be a reference implementation: every layer has one
job, the architecture is enforced by lint rules, and the whole thing runs with two commands.

- **Node 24 · TypeScript 6 · native ESM · SWC · pnpm**
- **Zod** request/response schemas that drive both validation and the OpenAPI document
- **JWT auth** with Argon2id passwords, rotating refresh tokens, roles and rate limiting
- **RFC 9457** `application/problem+json` errors with stable codes
- **Vitest** unit tests against in-memory ports and e2e tests against an in-memory MongoDB
- **Docker** multi-stage image, Compose stack, GitHub Actions CI, Dependabot

## Quick start

Prerequisites: Node ≥ 24 (`nvm use` picks it up from `.nvmrc`), pnpm 11 (`npm i -g pnpm`),
Docker.

```bash
pnpm install
cp .env.example .env            # then set the two JWT secrets: openssl rand -base64 48
docker compose up -d mongo      # MongoDB 8 with auth, data in a named volume
pnpm dev                        # http://localhost:3000, docs at /api/docs
```

Or run the whole stack from the production image:

```bash
docker compose up --build       # API on :3000, MongoDB on :27017
```

The first boot creates an admin account from `AUTH_BOOTSTRAP_ADMIN_EMAIL` /
`AUTH_BOOTSTRAP_ADMIN_PASSWORD` if they are set.

## API

Base path `/api/v1`. Interactive docs at `/api/docs`, raw OpenAPI at
`/api/docs/openapi.json` (enabled outside production by default, see `SWAGGER_ENABLED`).

| Method   | Path                            | Access | Purpose                                             |
| -------- | ------------------------------- | ------ | --------------------------------------------------- |
| `POST`   | `/auth/register`                | public | Create an account (role `user`)                     |
| `POST`   | `/auth/login`                   | public | Get access + refresh tokens                         |
| `POST`   | `/auth/refresh`                 | public | Rotate tokens (old refresh token becomes invalid)   |
| `POST`   | `/auth/logout`                  | bearer | Revoke the refresh token                            |
| `GET`    | `/auth/me`                      | bearer | Current account                                     |
| `GET`    | `/games`                        | public | List games, `?page=1&pageSize=20`                   |
| `GET`    | `/games/{id}`                   | public | Game by id                                          |
| `GET`    | `/games/{id}/publisher`         | public | The game's publisher                                |
| `POST`   | `/games`                        | bearer | Create a game                                       |
| `PUT`    | `/games/{id}`                   | bearer | Replace a game                                      |
| `DELETE` | `/games/{id}`                   | bearer | Delete a game                                       |
| `POST`   | `/games/maintenance`            | admin  | Retire games > 18 months old, discount 12–18 months |
| `GET`    | `/publishers`                   | public | List publishers                                     |
| `GET`    | `/publishers/{id}`              | public | Publisher by id                                     |
| `POST`   | `/publishers`                   | bearer | Create a publisher (SIRET must be unique and valid) |
| `PUT`    | `/publishers/{id}`              | bearer | Replace a publisher                                 |
| `DELETE` | `/publishers/{id}`              | bearer | Delete a publisher; its games lose the reference    |
| `GET`    | `/health/live`, `/health/ready` | public | Probes (outside the API prefix)                     |

Credential endpoints are limited to 10 requests per minute per IP; everything else to
`THROTTLE_LIMIT` per `THROTTLE_TTL_SECONDS`.

### Example session

```bash
# log in (admin created at boot, or register first)
TOKEN=$(curl -s localhost:3000/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@example.com","password":"change-me-strong-password"}' | jq -r .accessToken)

# create a publisher and a game
PUB=$(curl -s localhost:3000/api/v1/publishers -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"name":"Team Cherry","siret":"73282932000074","phone":"+61 2 1234 5678"}' | jq -r .id)

curl -s localhost:3000/api/v1/games -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d "{\"title\":\"Hollow Knight\",\"price\":14.99,\"tags\":[\"metroidvania\"],\"releaseDate\":\"2017-02-24T00:00:00Z\",\"publisherId\":\"$PUB\"}"
```

### Errors

Every error is an RFC 9457 problem. Domain errors carry a stable `code`; validation errors
list the offending fields.

```json
{
  "type": "urn:problem-type:game-not-found",
  "title": "Not Found",
  "status": 404,
  "detail": "Game \"…\" was not found",
  "code": "GAME_NOT_FOUND",
  "instance": "/api/v1/games/…",
  "requestId": "2d6f…"
}
```

| Status | When                                                          |
| ------ | ------------------------------------------------------------- |
| 400    | Request shape invalid (`errors[]` lists `path` + `message`)   |
| 401    | Missing/invalid token, bad credentials, revoked refresh token |
| 403    | Authenticated but lacking the required role                   |
| 404    | Unknown resource, or a game without a publisher               |
| 409    | Duplicate SIRET / e-mail                                      |
| 422    | Business rule violated (e.g. SIRET checksum, price precision) |
| 429    | Rate limited (`Retry-After` header)                           |

## Configuration

All configuration comes from environment variables, validated at start-up
(`src/config/env.schema.ts`). A `.env` file is loaded in development if present and never
overrides real environment variables.

| Variable                                                      | Default                  | Notes                                     |
| ------------------------------------------------------------- | ------------------------ | ----------------------------------------- |
| `NODE_ENV`                                                    | `development`            | `development` · `test` · `production`     |
| `PORT`                                                        | `3000`                   |                                           |
| `MONGODB_URI`                                                 | —                        | required                                  |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                     | —                        | required, ≥ 32 chars, must differ         |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`                           | `15m`, `7d`              | `<n>(ms\|s\|m\|h\|d)`                     |
| `AUTH_BOOTSTRAP_ADMIN_EMAIL`, `AUTH_BOOTSTRAP_ADMIN_PASSWORD` | —                        | optional; creates the admin on first boot |
| `CORS_ORIGINS`                                                | (disabled)               | comma-separated allow-list                |
| `TRUST_PROXY`                                                 | `false`                  | set `true` behind a reverse proxy         |
| `SWAGGER_ENABLED`                                             | `true` unless production |                                           |
| `LOG_LEVEL`                                                   | `debug` / `info` (prod)  | pino levels                               |
| `THROTTLE_TTL_SECONDS`, `THROTTLE_LIMIT`                      | `60`, `100`              | global rate limit per IP                  |

## Scripts

| Command          | What it does                                           |
| ---------------- | ------------------------------------------------------ |
| `pnpm dev`       | Start with hot reload (SWC + type-check in a worker)   |
| `pnpm build`     | Type-check and transpile to `dist/`                    |
| `pnpm start`     | Run the built app (`node dist/main.js`)                |
| `pnpm test`      | Unit + e2e tests                                       |
| `pnpm test:unit` | Unit tests only (`src/**/*.spec.ts`)                   |
| `pnpm test:e2e`  | End-to-end tests against an in-memory MongoDB          |
| `pnpm test:cov`  | Tests with coverage thresholds                         |
| `pnpm lint`      | ESLint, including the architecture boundary rules      |
| `pnpm typecheck` | `tsc --noEmit` over sources, tests and config          |
| `pnpm format`    | Prettier                                               |
| `pnpm check`     | typecheck + lint + format check + tests (what CI runs) |
| `pnpm docker:up` | `docker compose up --build -d`                         |

Commits follow [Conventional Commits](https://www.conventionalcommits.org); Husky runs
lint-staged on commit and commitlint on the message.

## Architecture in one minute

```
src/modules/<context>/
  domain/          entities, value objects, domain services, repository ports, errors  (no framework code)
  application/     use cases (one class each), cross-context ports
  infrastructure/  Mongoose schemas + mappers + repositories, event listeners, crypto, JWT
  presentation/    controllers, Zod schemas, presenters
  index.ts         the module's public API — the only file other modules may import
```

- Controllers validate with Zod, call a use case, and hand the result to a presenter.
- Use cases orchestrate aggregates through ports and publish domain events.
- Aggregates (`Game`, `Publisher`, `User`) own their invariants and behaviour.
- Cross-context collaboration is by contract: games check publishers through the
  `PublisherLookup` port and react to `PublisherDeletedEvent`.
- `eslint-plugin-boundaries` fails the build on any import that breaks the layering.

Read [`docs/architecture.md`](docs/architecture.md) for the full picture and
[`docs/adr/`](docs/adr) for the reasoning behind each decision.

## Project layout

```
.
├── src/                   application code (see above)
├── test/                  e2e specs + helpers (unit specs live next to the code)
├── docs/                  architecture notes and ADRs
├── .github/workflows/     CI: typecheck, lint, format, tests, build, docker image
├── Dockerfile             multi-stage, non-root, health-checked runtime image
├── compose.yaml           MongoDB 8 + API
├── eslint.config.ts       lint rules incl. architecture boundaries
└── vitest.config.ts       unit + e2e projects, coverage thresholds
```

## License

MIT © Kostiantyn Bohdanov
