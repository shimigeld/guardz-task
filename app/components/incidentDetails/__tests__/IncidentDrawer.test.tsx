import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

  return { closeIncident, setIncidents, openIncident };
};

const mutateAsync = vi.fn();
vi.mock('@/services/incidentService', () => ({
  useIncidentStream: () => ({ status: 'success' as const }),
  useIncidentsQuery: () => ({ data: { incidents: [mockIncident], total: 1 }, isLoading: false, error: null }),
  useIncidentDetailsQuery: () => ({ data: mockIncident, isLoading: false, isError: false }),
  useRelatedIncidentsQuery: () => ({ data: { related: [{ ...mockIncident, id: 'b', title: 'Sibling' }] }, isLoading: false, isError: false }),
  useIncidentUpdateMutation: () => ({ mutateAsync, isPending: false, error: null }),
}));

describe('IncidentDrawer', () => {
  beforeEach(() => {
    mutateAsync.mockClear();
  });

  it('renders details and closes via header button', async () => {
    const { closeIncident } = renderDrawer();
    expect(await screen.findByText('High severity event')).toBeInTheDocument();
    expect(screen.getByText(/Incident ID: a/)).toBeInTheDocument();

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

  it('updates owner and tags and opens related incident', async () => {
    const user = userEvent.setup();
    const { openIncident } = renderDrawer();

    const ownerInput = await screen.findByLabelText('Owner');
    await user.clear(ownerInput);
    await user.type(ownerInput, 'alex');

    const assignButton = screen.getByRole('button', { name: /assign owner/i });
    await user.click(assignButton);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ incidentId: 'a', data: { owner: 'alex' } }));

    const tagsInput = screen.getByLabelText(/Tags \(comma separated\)/i);
    fireEvent.change(tagsInput, { target: { value: 'p1, urgent' } });
    await waitFor(() => {
      const lastCall = mutateAsync.mock.calls.at(-1)?.[0];
      expect(lastCall).toEqual({ incidentId: 'a', data: { tags: ['p1', 'urgent'] } });
    });

    const relatedItem = await screen.findByText('Sibling');
    await user.click(relatedItem);
    expect(openIncident).toHaveBeenCalledWith('b');
  });
});
