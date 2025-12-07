# Incident Dashboard

Next.js + TypeORM demo that streams, filters, and bulk-updates incidents against a lightweight API. Includes unit tests (Vitest) and Playwright E2E coverage.

## What it does

- Live incident feed via EventSource with pause/resume and optional low-severity muting.
- Filtering (severity, status, account, source, date range, search) with persisted table sort and selection.
- Bulk actions (resolve, investigate, delete) with optimistic updates and rollbacks.
- Incident drawer for assignment, tagging, related incidents, and timeline.
- Seedable SQLite backend with an auto incident generator and REST routes under `/api/incidents`.

## Architecture

- **UI**: Next.js (App Router), MUI components, React Query for data/state, context providers for filters/table/selection/stream prefs.
- **Data**: TypeORM + SQLite, streaming endpoint `/api/incidents/stream`, REST for CRUD and related lookups.
- **HTTP**: Axios for client calls (wrapped by React Query) with optimistic updates for mutations.
- **Testing**: Vitest + Testing Library (unit/integration), Playwright (E2E streaming, filters, bulk flows). Test artifacts excluded via `.gitignore`.
- **Tooling**: ESLint, Prettier, TypeScript, PostCSS/Tailwind base, Playwright config for e2e.

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
