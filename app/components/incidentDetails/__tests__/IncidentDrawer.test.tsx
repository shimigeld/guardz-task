import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentDrawer } from '../IncidentDrawer';
import { ActiveIncidentContext } from '@/contexts/activeIncidentContext';
import { IncidentDataContext } from '@/contexts/incidentDataContext';
import type { Incident } from '@/types/incident';

const mockIncident: Incident = {
  id: 'a',
  severity: 'High',
  title: 'High severity event',
  account: 'Acme',
  source: 'EDR',
  timestamp: '2024-03-01T10:00:00Z',
  status: 'Open',
  tags: ['edr'],
  createdAt: '2024-03-01T10:00:00Z',
  updatedAt: '2024-03-01T10:00:00Z',
};

const renderDrawer = () => {
  const closeIncident = vi.fn();
  const setIncidents = vi.fn();
  const setTotal = vi.fn();
  const openIncident = vi.fn();

  render(
    <ActiveIncidentContext.Provider
      value={{ activeIncidentId: 'a', setActiveIncidentId: vi.fn(), openIncident, closeIncident }}
    >
      <IncidentDataContext.Provider
        value={{ incidents: [mockIncident], setIncidents, total: 1, setTotal }}
      >
        <IncidentDrawer />
      </IncidentDataContext.Provider>
    </ActiveIncidentContext.Provider>,
  );

  return { closeIncident, openIncident };
};

const mutateAsync = vi.fn();

let detailQuery: { data?: Incident; isLoading: boolean; isError: boolean; error?: unknown };
let relatedQuery: {
  data?: { related: Incident[] };
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
};

vi.mock('@/services/incidentService', () => ({
  useIncidentStream: () => ({ status: 'success' as const }),
  useIncidentsQuery: () => ({ data: { incidents: [mockIncident], total: 1 }, isLoading: false, error: null }),
  useIncidentDetailsQuery: () => detailQuery,
  useRelatedIncidentsQuery: () => relatedQuery,
  useIncidentUpdateMutation: () => ({ mutateAsync, isPending: false, error: null }),
}));

describe('IncidentDrawer', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mutateAsync.mockClear();
    mutateAsync.mockResolvedValue(undefined);
    detailQuery = { data: mockIncident, isLoading: false, isError: false };
    relatedQuery = {
      data: { related: [{ ...mockIncident, id: 'b', title: 'Sibling' }] },
      isLoading: false,
      isError: false,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('renders details and closes via header button', async () => {
    const { closeIncident } = renderDrawer();
    expect(await screen.findByText('High severity event')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close incident drawer/i });
    await userEvent.click(closeButton);
    expect(closeIncident).toHaveBeenCalled();
  });

  it('triggers resolve action', async () => {
    renderDrawer();
    const resolveButton = await screen.findByRole('button', { name: /mark as resolved/i });
    await userEvent.click(resolveButton);
    expect(mutateAsync).toHaveBeenCalledWith({ incidentId: 'a', data: { status: 'Resolved' } });
  });

  it('debounces tag updates and applies optimistic mutation', async () => {
    const user = userEvent.setup();
    renderDrawer();

    const tagsInput = await screen.findByLabelText(/Tags \(comma separated\)/i);
    await user.clear(tagsInput);
    await user.type(tagsInput, 'p1, urgent');

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
      const lastCall = mutateAsync.mock.calls.at(-1)?.[0];
      expect(lastCall?.incidentId).toBe('a');
      expect(lastCall?.data?.tags).toEqual(['p1', 'urgent']);
    }, { timeout: 1500 });
  });

  it('normalizes comma-separated tags to separate entries', async () => {
    const user = userEvent.setup();
    renderDrawer();

    const tagsInput = await screen.findByLabelText(/Tags \(comma separated\)/i);
    await user.clear(tagsInput);
    await user.type(tagsInput, 'critical  ,  security , critical ,network ,');

    await waitFor(() => {
      const lastCall = mutateAsync.mock.calls.at(-1)?.[0];
      expect(lastCall?.data?.tags).toEqual(['critical', 'security', 'network']);
    }, { timeout: 1500 });
  });

  it('shows detail error message when incident query fails', async () => {
    detailQuery = { isLoading: false, isError: true, error: new Error('boom') };

    renderDrawer();

    expect(await screen.findByText(/Failed to load incident details/i)).toBeInTheDocument();
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it('shows related error message when related query fails', async () => {
    relatedQuery = { isLoading: false, isError: true, error: new Error('no related') };

    renderDrawer();

    expect(await screen.findByText(/Failed to load related incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/no related/i)).toBeInTheDocument();
  });
});
