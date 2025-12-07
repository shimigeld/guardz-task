import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';
import type { IncidentFilters } from '@/types/incident';
import type { SortField } from './IncidentTable';

interface IncidentTableHeaderProps {
  filters: IncidentFilters;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSort: (field: SortField) => void;
}

/**
 * Table header with select-all and sortable severity/timestamp columns; other columns are static.
 * @param filters Current filters to drive sort direction state.
 * @param isAllSelected True when all rows are selected.
 * @param isSomeSelected True when a partial selection exists.
 * @param onSelectAll Handler for toggling select-all state.
 * @param onSort Handler for toggling sort on severity/timestamp.
 */
export const IncidentTableHeader = ({ filters, isAllSelected, isSomeSelected, onSelectAll, onSort }: IncidentTableHeaderProps) => {
  const severityDirection = filters.sortBy === 'severity' ? (filters.sortOrder?.toLowerCase() as 'asc' | 'desc') : 'desc';
  const timestampDirection = filters.sortBy === 'timestamp' ? (filters.sortOrder?.toLowerCase() as 'asc' | 'desc') : 'desc';

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox checked={isAllSelected} indeterminate={isSomeSelected} onChange={(e) => onSelectAll(e.target.checked)} />
        </TableCell>
        <TableCell align="center">
          <TableSortLabel active={filters.sortBy === 'severity'} direction={severityDirection} onClick={() => onSort('severity')}>
            Severity
          </TableSortLabel>
        </TableCell>
        <TableCell align="center">Title</TableCell>
        <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
          Account/Tenant
        </TableCell>
        <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
          Source
        </TableCell>
        <TableCell align="center">
          <TableSortLabel active={filters.sortBy === 'timestamp'} direction={timestampDirection} onClick={() => onSort('timestamp')}>
            Timestamp
          </TableSortLabel>
        </TableCell>
        <TableCell align="center">Status</TableCell>
        <TableCell align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
          Tags
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
