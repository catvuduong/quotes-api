# quotes-api

API-only monorepo (npm workspaces): `apps/api` (NestJS + Postgres via `pg`). No frontend.

## Rules for automated tasks
- Work only inside this repo, on the branch you are given. Never push, never touch `main`, never edit `.github/workflows` or deploy config unless the task says so.
- Never read, print or create secrets. Do not add `.env` files with real values.
- Keep changes small and focused on the task. Add or update unit tests (`apps/api/src/*.spec.ts`) and e2e tests (`apps/api/test/*.e2e-spec.ts`) for every behaviour change.
- `GET /` should return a small human-readable description of the API and its endpoints (it is the landing page of the live demo).
- Before finishing run `npm run verify` (lint, unit tests, build, e2e) and fix failures. Do not disable or delete tests.
- The API reads `DATABASE_URL` (optional locally: health reports `db: disabled`).

- Tests that persist data need Postgres: `npm run verify` runs with `DATABASE_URL` already pointing at a throwaway local postgres (docker compose service `db`, port 55432). Create tables in code (`CREATE TABLE IF NOT EXISTS`), never rely on manual setup.

## Commands
- `npm install` — install all workspaces
- `npm run verify` — full local check, same as CI
