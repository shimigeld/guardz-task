import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentManager } from '../IncidentManager';

const mockIncidents = [
  {
    id: 'a',
    severity: 'High' as const,
    title: 'High severity event',
    account: 'Acme',
    source: 'EDR',
    timestamp: '2024-03-01T10:00:00Z',
    status: 'Open' as const,
    tags: ['edr'],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'b',
    severity: 'Low' as const,
    title: 'Low signal',
    account: 'Beta',
    source: 'SIEM',
    timestamp: '2024-03-02T12:00:00Z',
    status: 'Investigating' as const,
    tags: [],
    createdAt: '2024-03-02T12:00:00Z',
    updatedAt: '2024-03-02T12:00:00Z',
  },
];

const bulkMutate = vi.fn();

vi.mock('@/services/incidentService', () => ({
  useIncidentsQuery: () => ({
    data: { incidents: mockIncidents, total: mockIncidents.length },
    isLoading: false,
    error: null,
  }),
  useIncidentStream: () => ({ status: 'success' as const }),
  useIncidentDetailsQuery: () => ({ data: undefined, isLoading: false, isError: false }),
  useRelatedIncidentsQuery: () => ({ data: { related: [] }, isLoading: false, isError: false }),
  useIncidentUpdateMutation: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useIncidentBulkActionMutation: () => ({ mutate: bulkMutate, isPending: false }),
}));

describe('IncidentManager integration', () => {
  beforeEach(() => {
    bulkMutate.mockClear();
    window.localStorage?.clear?.();
  });

  it('renders incidents, toggles sort, and enables bulk actions after selection', async () => {
    const user = userEvent.setup();

    render(<IncidentManager />);

    expect(await screen.findByText('High severity event')).toBeInTheDocument();
    expect(screen.getByText(/Total: 2 incidents/i)).toBeInTheDocument();

    const severitySort = screen.getByRole('button', { name: /severity/i });
    await user.click(severitySort);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    const resolveButton = await screen.findByRole('button', { name: /resolve selected/i });
    expect(resolveButton).toBeInTheDocument();

    await user.click(resolveButton);
    expect(bulkMutate).toHaveBeenCalled();
  });
});
