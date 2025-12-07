'use client';

import { Box, Chip, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useIncidentFilters } from '@/contexts/filtersContext';
import type { IncidentFilters } from '@/types/incident';

const ACTIVE_FILTER_KEYS: Array<keyof IncidentFilters> = [
  'severity',
  'status',
  'account',
  'source',
  'startDate',
  'endDate',
];

export const ActivatedFilters = () => {
  const { filters, setFilters } = useIncidentFilters();

  const activeFilterCount = ACTIVE_FILTER_KEYS.reduce(
    (count, key) => (filters[key] ? count + 1 : count),
    0,
  );

  const clearAllFilters = () => {
    setFilters((prev: IncidentFilters) => ({
      search: prev.search,
      sortBy: prev.sortBy,
      sortOrder: prev.sortOrder,
    }));
  };

  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'flex-start' }}>
      <Chip
        label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
        size="small"
        color="primary"
        variant="outlined"
      />
      <IconButton size="small" onClick={clearAllFilters} title="Clear all filters">
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
