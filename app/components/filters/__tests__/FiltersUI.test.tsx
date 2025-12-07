import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { IncidentProvider } from '@/contexts/IncidentContext';
import { useIncidentFilters } from '@/contexts/filtersContext';
import { useIncidentData } from '@/contexts/incidentDataContext';
import type { Incident } from '@/types/incident';
import { SelectFilter } from '../SelectFilter';
import { ActivatedFilters } from '../ActivatedFilters';

const FiltersViewer = () => {
  const { filters } = useIncidentFilters();
  return (
    <div>
      <div data-testid="filters-account">{filters.account ?? ''}</div>
      <div data-testid="filters-severity">{filters.severity ?? ''}</div>
      <div data-testid="filters-status">{filters.status ?? ''}</div>
    </div>
  );
};

const IncidentSeeder = ({ incidents }: { incidents: Incident[] }) => {
  const { setIncidents, setTotal } = useIncidentData();

  useEffect(() => {
    setIncidents(incidents);
    setTotal(incidents.length);
  }, [incidents, setIncidents, setTotal]);

  return null;
};

const FilterSetter = ({ severity, status }: { severity?: string; status?: string }) => {
  const { setFilters } = useIncidentFilters();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, severity, status }));
  }, [setFilters, severity, status]);

  return null;
};

describe('Filters UI', () => {
  it('SelectFilter shows derived options and updates filters', async () => {
    window.localStorage?.clear?.();
    const user = userEvent.setup();

    const incidents: Incident[] = [
      {
        id: '1',
        severity: 'High',
        status: 'Open',
        account: 'Acme Corp',
        source: 'EDR',
        title: 'Endpoint alert',
        timestamp: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tags: [],
      },
      {
        id: '2',
        severity: 'Low',
        status: 'Resolved',
        account: 'Globex',
        source: 'SIEM',
        title: 'Benign signal',
        timestamp: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        tags: [],
      },
    ];

    render(
      <IncidentProvider>
        <IncidentSeeder incidents={incidents} />
        <SelectFilter label="Account" />
        <FiltersViewer />
      </IncidentProvider>,
    );

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const acmeOption = await screen.findByRole('option', { name: 'Acme Corp' });
    await user.click(acmeOption);

    await waitFor(() => expect(screen.getByTestId('filters-account')).toHaveTextContent('Acme Corp'));

    await user.click(selectTrigger);
    const allOption = await screen.findByRole('option', { name: 'All' });
    await user.click(allOption);

    await waitFor(() => expect(screen.getByTestId('filters-account')).toHaveTextContent(''));
  });

  it('ActivatedFilters displays active count and clears all non-search filters', async () => {
    window.localStorage?.clear?.();
    const user = userEvent.setup();

    render(
      <IncidentProvider>
        <FilterSetter severity="High" status="Open" />
        <ActivatedFilters />
        <FiltersViewer />
      </IncidentProvider>,
    );

    const activeChip = await screen.findByText(/filters? active/i);
    expect(activeChip).toHaveTextContent('2 filters active');

    const clearButton = screen.getByRole('button', { name: /clear all filters/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText(/filters? active/i)).toBeNull();
      expect(screen.getByTestId('filters-severity')).toHaveTextContent('');
      expect(screen.getByTestId('filters-status')).toHaveTextContent('');
    });
  });
});
