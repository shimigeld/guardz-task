# Incident Dashboard

Next.js + TypeORM demo that streams, filters, and bulk-updates incidents against a lightweight API. Includes unit tests (Vitest) and Playwright E2E coverage.

## Prerequisites

- Node.js 18+
- npm (ships with Node)

## Setup

```bash
npm install
```

## Run the app

```bash
npm run dev
```

- SQLite DB is created on first run; the incident generator begins producing a new incident every 30s once the API is hit.
- Optional seed for deterministic data:

```bash
curl -X POST http://localhost:3000/api/incidents/seed
```

## Testing

- Unit/integration (JSDOM): `npm test`
- E2E (requires dev server running): `npm run test:e2e`

## Quality gates

- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Format: `npm run format` (check-only: `npm run format:check`)

## Notes

- API details live in `BACKEND_README.md`.
- Uses React Query for data fetching, MUI for UI, and EventSource-based streaming for live updates.
