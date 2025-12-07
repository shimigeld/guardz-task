# Backend API Documentation

This backend provides a minimal API to support the Incident Dashboard frontend assignment.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The database will be automatically created and initialized when the server starts. The incident generator will automatically start, generating a new incident every 30 seconds.

## Database

- **Database**: SQLite (stored in `dev.db`)
- **ORM**: TypeORM
- **Schema**: See `lib/db/entity/Incident.ts`

### Incident Entity

- `id`: UUID (auto-generated)
- `severity`: String (Critical, High, Med, Low)
- `title`: String
- `account`: String (Account/Tenant name)
- `source`: String (EDR, Email, Identity, Network, Cloud, Endpoint)
- `timestamp`: DateTime (defaults to now)
- `status`: String (Open, Investigating, Resolved) - defaults to "Open"
- `tags`: JSON array stored as string (defaults to "[]")
- `owner`: String? (optional, assigned owner)
- `createdAt`: DateTime (auto-managed)
- `updatedAt`: DateTime (auto-managed)

## API Endpoints

### GET /api/incidents

Get all incidents with optional filtering, sorting, and pagination.

**Query Parameters:**

- `severity`: Filter by severity (Critical, High, Med, Low)
- `status`: Filter by status (Open, Investigating, Resolved)
- `account`: Filter by account name
- `source`: Filter by source
- `search`: Search in title, account, or source
- `sortBy`: Field to sort by (default: "timestamp")
- `sortOrder`: "ASC" or "DESC" (default: "DESC")
- `limit`: Number of results to return
- `offset`: Number of results to skip

**Response:**

```json
{
  "incidents": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### GET /api/incidents/[id]

Get a single incident by ID.

**Response:**

```json
{
  "id": "...",
  "severity": "Critical",
  "title": "...",
  "account": "...",
  "source": "...",
  "timestamp": "...",
  "status": "Open",
  "tags": ["tag1", "tag2"],
  "owner": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### PATCH /api/incidents/[id]

Update an incident. All fields are optional.

**Request Body:**

```json
{
  "status": "Resolved",
  "owner": "analyst-1",
  "tags": ["urgent", "malware"],
  "severity": "High",
  "title": "Updated title",
  "account": "new-account",
  "source": "EDR"
}
```

**Response:** Updated incident object

### GET /api/incidents/[id]/related

Get related incidents (same account or same source).

**Response:**

```json
{
  "related": [...]
}
```

### GET /api/incidents/stream

Server-Sent Events (SSE) endpoint for real-time incident updates.

The stream sends events whenever new incidents are created:

```json
{
  "type": "new_incidents",
  "incidents": [...]
}
```

### POST /api/incidents/seed

Generate 1000 sample incidents. Useful for initial data population.

**Response:**

```json
{
  "message": "Generated 10 incidents",
  "incidents": [...]
}
```

## Incident Generator

The backend automatically generates incidents every 30 seconds. The generator:

- Creates incidents with random severity, source, account, title, status, and tags
- Stores them in the database
- New incidents are automatically picked up by the SSE stream

The generator starts automatically when you first access any API endpoint.

## Sample Data Files

Two sample data files are provided in the `public/` directory:

- `incidents.json`: Initial dataset of sample incidents
- `incident-stream.json`: Pool of incidents that can be used for streaming simulation

These are provided for reference. The backend generates its own incidents automatically.

## Notes for Candidates

- The backend is intentionally minimal - you can extend it as needed
- All incidents are stored in SQLite, so they persist across server restarts
- The SSE endpoint polls every 2 seconds for new incidents
- You can use the provided endpoints as-is or modify them to suit your frontend needs
