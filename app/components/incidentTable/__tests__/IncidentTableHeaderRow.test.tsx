import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table } from '@mui/material';
import { IncidentTableHeader } from '../IncidentTableHeader';

describe('IncidentTableHeader', () => {
  it('renders sort labels and checkbox state', () => {
    const handleSort = vi.fn();
    const handleSelectAll = vi.fn();

    render(
      <Table>
        <IncidentTableHeader
          filters={{ sortBy: 'severity', sortOrder: 'ASC' }}
          isAllSelected={false}
          isSomeSelected
          onSelectAll={handleSelectAll}
          onSort={handleSort}
        />
      </Table>,
    );

    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-indeterminate', 'true');
  });

  it('calls sort and select callbacks', async () => {
    const handleSort = vi.fn();
    const handleSelectAll = vi.fn();

    render(
      <Table>
        <IncidentTableHeader
          filters={{}}
          isAllSelected={false}
          isSomeSelected={false}
          onSelectAll={handleSelectAll}
          onSort={handleSort}
        />
      </Table>,
    );

    await screen.findByRole('button', { name: /severity/i }).then((btn) => btn.click());
    await screen.findByRole('button', { name: /timestamp/i }).then((btn) => btn.click());
    const selectAll = screen.getByRole('checkbox');
    selectAll.click();

    expect(handleSort).toHaveBeenNthCalledWith(1, 'severity');
    expect(handleSort).toHaveBeenNthCalledWith(2, 'timestamp');
    expect(handleSelectAll).toHaveBeenCalledWith(true);
  });
});
