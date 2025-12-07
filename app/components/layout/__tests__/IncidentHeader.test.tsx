import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/contexts/filtersContext', () => ({
  useIncidentFilters: () => ({ filters: {}, setFilters: vi.fn() }),
}));

vi.mock('../filters/IncidentFiltersBar', () => ({ IncidentFiltersBar: () => <div data-testid="filters-bar" /> }));
vi.mock('@/components/filters/IncidentFiltersBar', () => ({ IncidentFiltersBar: () => <div data-testid="filters-bar" /> }));
vi.mock('../bulk/IncidentBulkActions', () => ({ IncidentBulkActions: () => <div data-testid="bulk-actions" /> }));
vi.mock('@/components/bulk/IncidentBulkActions', () => ({ IncidentBulkActions: () => <div data-testid="bulk-actions" /> }));
vi.mock('../StreamControls', () => ({ StreamControls: () => <div data-testid="stream-controls" /> }));
vi.mock('@/components/layout/StreamControls', () => ({ StreamControls: () => <div data-testid="stream-controls" /> }));
vi.mock('@/contexts/incidentDataContext', () => ({ useIncidentData: () => ({ total: 3 }) }));
vi.mock('@/contexts/streamPrefsContext', () => ({
  useIncidentStreamPrefs: () => ({
    isStreamPaused: false,
    setIsStreamPaused: vi.fn(),
    muteLowWhileStreaming: false,
    setMuteLowWhileStreaming: vi.fn(),
  }),
}));

import { IncidentHeader } from '../IncidentHeader';

describe('IncidentHeader', () => {
  it('renders heading, total count, and child sections', () => {
    render(<IncidentHeader />);

    expect(screen.getByText('Incidents')).toBeInTheDocument();
    expect(screen.getByText(/Total: 3 incidents/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search incidents...')).toBeInTheDocument();
    expect(screen.getByTestId('stream-controls')).toBeInTheDocument();
    expect(screen.getByTestId('filters-bar')).toBeInTheDocument();
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
  });
});
