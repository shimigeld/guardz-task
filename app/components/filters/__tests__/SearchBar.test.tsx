import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentProvider } from '@/contexts/IncidentContext';
import { useIncidentFilters } from '@/contexts/filtersContext';
import { SearchBar } from '../SearchBar';

vi.mock('@/hooks/useDebouncedValue', () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

const FiltersViewer = () => {
  const { filters } = useIncidentFilters();
  return <div data-testid="filters-search">{filters.search ?? ''}</div>;
};

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<IncidentProvider>{ui}</IncidentProvider>);
};

describe('SearchBar', () => {
  it('updates filters.search after debounce and clears correctly', async () => {
  window.localStorage?.clear?.();
	const user = userEvent.setup();

    renderWithProvider(
      <>
		<SearchBar />
        <FiltersViewer />
      </>,
    );

    const input = screen.getByPlaceholderText('Search incidents...');
    await user.type(input, 'network');

    await waitFor(() => {
    expect(screen.getByTestId('filters-search')).toHaveTextContent('network');
    expect((input as HTMLInputElement).value).toBe('network');
  });

    const clearButton = screen.getByLabelText('Clear search');
    await user.click(clearButton);

    // Clearing should remove the search text immediately
    await waitFor(() => {
		expect(screen.getByTestId('filters-search')).toHaveTextContent('');
	});
  });
});
