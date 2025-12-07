import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  useIncidentBulkActionMutation,
  useIncidentStream,
  useIncidentUpdateMutation,
  useIncidentsQuery,
} from '../incidentService';
import type { Incident, IncidentFilters, IncidentsResponse, TableState } from '@/types/incident';

const createWrapper = (client: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };

const buildIncident = (overrides: Partial<Incident> = {}): Incident => ({
  id: '1',
  severity: 'High',
  title: 'Test incident',
  account: 'acc-1',
  source: 'src-1',
  timestamp: '2024-01-01T00:00:00Z',
  status: 'Open',
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('incidentService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches incidents with query params applied', async () => {
    const filters: IncidentFilters & TableState = {
      search: 'query',
      severity: 'High',
      status: 'Open',
      account: 'acc-1',
      source: 'src-1',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      sortBy: 'timestamp',
      sortOrder: 'DESC',
      limit: 20,
      offset: 5,
    };

    const response: IncidentsResponse = {
      incidents: [buildIncident()],
      total: 1,
      limit: 20,
      offset: 5,
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useIncidentsQuery(filters), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      '/api/incidents?search=query&severity=High&status=Open&account=acc-1&source=src-1&startDate=2024-01-01&endDate=2024-01-31&sortBy=timestamp&sortOrder=DESC&limit=20&offset=5',
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      signal: expect.any(AbortSignal),
    });
    expect(result.current.data).toEqual(response);
    client.clear();
  });

  it('exposes an error when fetching incidents fails', async () => {
    const filters: IncidentFilters & TableState = {
      limit: 10,
      offset: 0,
    };

    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    global.fetch = fetchMock as unknown as typeof fetch;

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(() => useIncidentsQuery(filters), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toContain('Failed to fetch incidents');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    client.clear();
  });

  it('optimistically updates incidents and syncs caches on successful mutation', async () => {
    const incident = buildIncident({ status: 'Open', id: 'abc' });
    const updated = { ...incident, status: 'Resolved' as const };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updated),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    let incidentsState: Incident[] = [incident];
    const setIncidents = (updater: (prev: Incident[]) => Incident[]) => {
      incidentsState = updater(incidentsState);
    };

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    client.setQueryData(['incident', incident.id], incident);
    client.setQueryData(['incidents', { limit: 10, offset: 0 }], {
      incidents: [incident],
      total: 1,
      limit: 10,
      offset: 0,
    } satisfies IncidentsResponse);

    const { result } = renderHook(() => useIncidentUpdateMutation(setIncidents), {
      wrapper: createWrapper(client),
    });

    await result.current.mutateAsync({
      incidentId: incident.id,
      data: { status: 'Resolved' },
    });

    const cachedIncident = client.getQueryData<Incident>(['incident', incident.id]);
    const cachedList = client.getQueryData<IncidentsResponse>(['incidents', { limit: 10, offset: 0 }]);

    expect(fetchMock).toHaveBeenCalledWith(`/api/incidents/${incident.id}`, expect.objectContaining({ method: 'PATCH' }));
    expect(cachedIncident?.status).toBe('Resolved');
    expect(cachedList?.incidents[0].status).toBe('Resolved');
    expect(incidentsState[0].status).toBe('Resolved');
    client.clear();
  });

  it('rolls back optimistic update when mutation fails', async () => {
    const incident = buildIncident({ status: 'Open', id: 'xyz' });

    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    global.fetch = fetchMock as unknown as typeof fetch;

    let incidentsState: Incident[] = [incident];
    const setIncidents = (updater: (prev: Incident[]) => Incident[]) => {
      incidentsState = updater(incidentsState);
    };

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    client.setQueryData(['incident', incident.id], incident);
    client.setQueryData(['incidents', { limit: 5, offset: 0 }], {
      incidents: [incident],
      total: 1,
      limit: 5,
      offset: 0,
    } satisfies IncidentsResponse);

    const { result } = renderHook(() => useIncidentUpdateMutation(setIncidents), {
      wrapper: createWrapper(client),
    });

    await expect(
      result.current.mutateAsync({
        incidentId: incident.id,
        data: { status: 'Resolved' },
      }),
    ).rejects.toThrow('Failed to update incident');

    const cachedIncident = client.getQueryData<Incident>(['incident', incident.id]);
    const cachedList = client.getQueryData<IncidentsResponse>(['incidents', { limit: 5, offset: 0 }]);

    expect(cachedIncident?.status).toBe('Open');
    expect(cachedList?.incidents[0].status).toBe('Open');
    expect(incidentsState[0].status).toBe('Open');
    client.clear();
  });

  it('handles bulk resolve optimistically and updates caches', async () => {
    const first = buildIncident({ id: 'a', status: 'Open' });
    const second = buildIncident({ id: 'b', status: 'Investigating' });
    const updatedFirst = { ...first, status: 'Investigating' as const };
    const updatedSecond = { ...second, status: 'Investigating' as const };

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/incidents/a')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(updatedFirst) });
      }
      if (url.includes('/api/incidents/b')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(updatedSecond) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    let incidentsState: Incident[] = [first, second];
    const setIncidents = (updater: (prev: Incident[]) => Incident[]) => {
      incidentsState = updater(incidentsState);
    };

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['incidents', { limit: 10, offset: 0 }], {
      incidents: incidentsState,
      total: 2,
      limit: 10,
      offset: 0,
    } satisfies IncidentsResponse);

    const { result } = renderHook(
      () => useIncidentBulkActionMutation([...incidentsState], setIncidents),
      { wrapper: createWrapper(client) },
    );

    await result.current.mutateAsync({ ids: ['a', 'b'], action: 'investigate' });

    const cachedList = client.getQueryData<IncidentsResponse>(['incidents', { limit: 10, offset: 0 }]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cachedList?.incidents.every((i) => i.status === 'Investigating')).toBe(true);
    expect(incidentsState.every((i) => i.status === 'Investigating')).toBe(true);
    client.clear();
  });

  it('rolls back bulk delete when request fails', async () => {
    const first = buildIncident({ id: 'a', status: 'Open' });
    const second = buildIncident({ id: 'b', status: 'Investigating' });

    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    global.fetch = fetchMock as unknown as typeof fetch;

    let incidentsState: Incident[] = [first, second];
    const setIncidents = (updater: (prev: Incident[]) => Incident[]) => {
      incidentsState = updater(incidentsState);
    };

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['incidents', { limit: 10, offset: 0 }], {
      incidents: incidentsState,
      total: 2,
      limit: 10,
      offset: 0,
    } satisfies IncidentsResponse);

    const { result } = renderHook(
      () => useIncidentBulkActionMutation([...incidentsState], setIncidents),
      { wrapper: createWrapper(client) },
    );

    await expect(result.current.mutateAsync({ ids: ['a', 'b'], action: 'delete' })).rejects.toThrow();

    const cachedList = client.getQueryData<IncidentsResponse>(['incidents', { limit: 10, offset: 0 }]);

    expect(cachedList?.incidents).toHaveLength(2);
    expect(incidentsState).toHaveLength(2);
    client.clear();
  });

  it('opens an EventSource once and invokes handler on messages', async () => {
    const listeners: Record<string, (() => void) | undefined> = {};
    const closeSpy = vi.fn();
    const addEventListener = vi.fn((event: string, cb: () => void) => {
      listeners[event] = cb;
    });

    let createdSource: EventSource | null = null;

    class FakeEventSource {
      onopen: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(url: string) {
        void url; // keep signature without unused lint
        setTimeout(() => this.onopen?.(), 0);
        createdSource = this as unknown as EventSource;
      }
      close = closeSpy;
      addEventListener = addEventListener as unknown as EventSource['addEventListener'];
    }

    // @ts-expect-error override global
    global.EventSource = FakeEventSource;

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const handler = vi.fn();

    const { result } = renderHook(() => useIncidentStream(handler), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const event = new MessageEvent('message', {
      data: JSON.stringify({ type: 'new_incidents', id: 'n1', severity: 'Low', title: 'New', account: 'acc', source: 'src', timestamp: 't', status: 'Open', tags: [], createdAt: 'c', updatedAt: 'u' }),
    });

    const sourceWithHandler = createdSource as unknown as {
      onmessage?: (e: MessageEvent) => void;
    } | null;

    sourceWithHandler?.onmessage?.(event);

    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    expect(closeSpy).not.toHaveBeenCalled();
    client.clear();
  });
});
