import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentBulkActions } from '../IncidentBulkActions';
import { SelectionContext } from '@/contexts/selectionContext';
import { IncidentDataContext } from '@/contexts/incidentDataContext';
import type { Incident } from '@/types/incident';

const sampleIncidents: Incident[] = [
  {
    id: '1',
    severity: 'High',
    title: 'Sample',
    account: 'Acme',
    source: 'EDR',
    timestamp: '2024-01-01T00:00:00Z',
    status: 'Open',
    tags: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const setSelectedIds = vi.fn();
const mutate = vi.fn();

vi.mock('@/services/incidentService', () => ({
  useIncidentBulkActionMutation: () => ({
    mutate: (vars: { ids: string[]; action: string }, opts?: { onSuccess?: () => void }) => {
      mutate(vars);
      opts?.onSuccess?.();
    },
    isPending: false,
  }),
}));

describe('IncidentBulkActions', () => {
  beforeEach(() => {
    setSelectedIds.mockClear();
    mutate.mockClear();
  });

  const renderWithProviders = (selected: string[]) =>
    render(
      <IncidentDataContext.Provider value={{ incidents: sampleIncidents, setIncidents: vi.fn(), total: 1, setTotal: vi.fn() }}>
        <SelectionContext.Provider value={{ selectedIds: new Set(selected), setSelectedIds }}>
          <IncidentBulkActions />
        </SelectionContext.Provider>
      </IncidentDataContext.Provider>,
    );

  it('hides when no selection', () => {
    renderWithProviders([]);
    expect(screen.queryByRole('button', { name: /resolve selected/i })).toBeNull();
  });

  it('triggers bulk resolve and resets selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(['1']);

    const resolveBtn = await screen.findByRole('button', { name: /resolve selected/i });
    await user.click(resolveBtn);
    expect(mutate).toHaveBeenCalledWith({ ids: ['1'], action: 'resolve' });
    expect(setSelectedIds).toHaveBeenCalledWith(new Set());
  });
});
