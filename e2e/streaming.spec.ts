import { test, expect, Page, Route } from '@playwright/test';

type Incident = {
  id: string;
  severity: 'Critical' | 'High' | 'Med' | 'Low';
  title: string;
  account: string;
  source: string;
  timestamp: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

const initialIncidents: Incident[] = [
  {
    id: 'seed-1',
    severity: 'High',
    title: 'Initial Incident',
    account: 'acc-1',
    source: 'src-1',
    timestamp: '2024-01-01T00:00:00Z',
    status: 'Open',
    tags: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'seed-2',
    severity: 'Low',
    title: 'Background Noise',
    account: 'acc-2',
    source: 'src-2',
    timestamp: '2024-01-02T00:00:00Z',
    status: 'Investigating',
    tags: ['low'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'seed-3',
    severity: 'Critical',
    title: 'Critical Outage',
    account: 'acc-1',
    source: 'src-1',
    timestamp: '2024-01-03T00:00:00Z',
    status: 'Open',
    tags: ['p1'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const pushStreamEvent = async (
  page: Page,
  incident: Record<string, unknown>,
) => {
  await page.evaluate((data: Record<string, unknown>) => {
    // @ts-expect-error injected helper set in addInitScript
    window.__pushStreamEvent?.(data);
  }, incident);
};

test.beforeEach(async ({ page }: { page: Page }) => {
  // fresh incidents per test to keep state isolated
  const incidents: Incident[] = initialIncidents.map((i) => ({ ...i }));

  await page.addInitScript(() => {
    class MockEventSource {
      static instances: MockEventSource[] = [];
      onopen: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(url: string) {
        void url;
        MockEventSource.instances.push(this);
        setTimeout(() => this.onopen?.(), 0);
      }
      close() {}
    }

    // Expose a helper for tests to push message events
    // @ts-expect-error test-only helper
    window.__pushStreamEvent = (data: unknown) => {
      MockEventSource.instances.forEach((instance) =>
        instance.onmessage?.({ data: JSON.stringify(data) } as MessageEvent),
      );
    };

    // @ts-expect-error override global EventSource in tests
    window.EventSource = MockEventSource;
  });

  await page.route('**/api/incidents**', async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    // Handle updates/deletes
    if (method !== 'GET') {
      const id = url.pathname.split('/').pop();
      if (method === 'PATCH' && id) {
        const body = (await route
          .request()
          .postDataJSON()) as Partial<Incident>;
        const idx = incidents.findIndex((i) => i.id === id);
        if (idx >= 0) {
          incidents[idx] = {
            ...incidents[idx],
            ...body,
            updatedAt: new Date().toISOString(),
          };
          return route.fulfill({ json: incidents[idx] });
        }
        return route.fulfill({ status: 404, json: { message: 'Not found' } });
      }
      if (method === 'DELETE' && id) {
        const remaining = incidents.filter((i) => i.id !== id);
        if (remaining.length === incidents.length) {
          return route.fulfill({ status: 404, json: { message: 'Not found' } });
        }
        const deleted = incidents.find((i) => i.id === id);
        incidents.splice(0, incidents.length, ...remaining);
        return route.fulfill({ json: { id: deleted?.id } });
      }
    }

    // Default GET handler with basic filtering
    const params = url.searchParams;
    let filtered = [...incidents];

    const search = params.get('search');
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((i) =>
        `${i.title} ${i.account} ${i.source}`.toLowerCase().includes(term),
      );
    }

    const severity = params.get('severity');
    if (severity) filtered = filtered.filter((i) => i.severity === severity);

    const status = params.get('status');
    if (status) filtered = filtered.filter((i) => i.status === status);

    return route.fulfill({
      json: { incidents: filtered, total: filtered.length },
    });
  });
});

const visitAndWaitForBase = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByText(initialIncidents[0].title)).toBeVisible();
};

test('streams new incidents while active', async ({ page }: { page: Page }) => {
  await visitAndWaitForBase(page);

  const streamed = {
    ...initialIncidents[0],
    id: 'stream-1',
    title: 'Streamed Incident 1',
    severity: 'Critical',
  };

  await pushStreamEvent(page, { type: 'new_incidents', incidents: [streamed] });

  await expect(page.getByText(streamed.title)).toBeVisible();
});

test('queues while paused and flushes on resume', async ({
  page,
}: {
  page: Page;
}) => {
  await visitAndWaitForBase(page);

  await page.getByRole('button', { name: /Pause stream/i }).click();

  const queued = {
    ...initialIncidents[0],
    id: 'queued-1',
    title: 'Queued Incident',
  };
  await pushStreamEvent(page, { type: 'new_incidents', incidents: [queued] });

  await expect(page.getByText(queued.title)).toHaveCount(0);

  await page.getByRole('button', { name: /Resume stream/i }).click();

  await expect(page.getByText(queued.title)).toBeVisible();
});

test('mutes low severity while streaming', async ({ page }: { page: Page }) => {
  await visitAndWaitForBase(page);

  await page.getByLabel('Mute low severity while streaming').click();

  const lowIncident = {
    ...initialIncidents[0],
    id: 'low-1',
    title: 'Muted Low',
    severity: 'Low',
  };
  await pushStreamEvent(page, {
    type: 'new_incidents',
    incidents: [lowIncident],
  });

  await expect(page.getByText(lowIncident.title)).toHaveCount(0);

  const highIncident = {
    ...initialIncidents[0],
    id: 'high-1',
    title: 'Allowed High',
    severity: 'High',
  };
  await pushStreamEvent(page, {
    type: 'new_incidents',
    incidents: [highIncident],
  });

  await expect(page.getByText(highIncident.title)).toBeVisible();
});

test('filters incidents by persisted severity and search', async ({
  page,
}: {
  page: Page;
}) => {
  // Preload severity filter in local storage to mimic persisted user preference
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'incidentFilters',
      JSON.stringify({
        severity: 'Critical',
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      }),
    );
  });

  await page.goto('/');

  await expect(page.getByText('Critical Outage')).toBeVisible();
  await expect(page.getByText('Initial Incident')).toHaveCount(0);

  // Clear filters via activated chip control
  await page.getByTitle('Clear all filters').click();
  await expect(page.getByText('Initial Incident')).toBeVisible();

  await page.getByPlaceholder('Search incidents...').fill('Noise');
  await expect(page.getByText('Background Noise')).toBeVisible();
  await expect(page.getByText('Initial Incident')).toHaveCount(0);
});

test('bulk resolve then delete selected incidents', async ({
  page,
}: {
  page: Page;
}) => {
  await visitAndWaitForBase(page);

  // select all via header checkbox
  await page.locator('thead').getByRole('checkbox').click();

  await expect(
    page.getByRole('button', { name: 'Resolve Selected' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Resolve Selected' }).click();

  await expect(page.getByText('Resolved')).toHaveCount(3);

  // re-select all after resolve clears selection
  await page.locator('thead').getByRole('checkbox').click();
  await page.getByRole('button', { name: 'Delete Selected' }).click();

  await expect(page.getByText('No incidents found')).toBeVisible();
});
