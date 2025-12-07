'use client';

import { Box } from '@mui/material';
import { SelectFilter } from './SelectFilter';
import { TextFilter } from './TextFilter';
import { ActivatedFilters } from './ActivatedFilters';

/**
 * Grid of select/text filters plus the activated-filters summary row.
 * @returns Responsive filter grid for incident list.
 */
export const IncidentFiltersBar = () => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        alignItems: 'flex-start',
      }}
    >
      <SelectFilter label="Severity" />
      <SelectFilter label="Status" />
      <SelectFilter label="Account" />
      <SelectFilter label="Source" />
      <TextFilter label="Start Date" filterKey="startDate" />
      <TextFilter label="End Date" filterKey="endDate" />
      <Box sx={{ gridColumn: { xs: 'auto', sm: 'span 2', lg: 'span 4' } }}>
        <ActivatedFilters />
      </Box>
    </Box>
  );
};
