'use client';

import { TextField } from '@mui/material';
import { useIncidentFilters } from '@/contexts/filtersContext';
import type { IncidentFilters } from '@/types/incident';

interface TextFilterProps {
  label: string;
  filterKey: 'startDate' | 'endDate';
}

export const TextFilter = ({ label, filterKey }: TextFilterProps) => {
  const { filters, setFilters } = useIncidentFilters();
  const value = filters[filterKey] || '';

  const handleChange = (nextValue: string) => {
    const normalized = nextValue || undefined;
    setFilters((prev: IncidentFilters) => {
      if (prev[filterKey] === normalized) {
        return prev;
      }
      return { ...prev, [filterKey]: normalized };
    });
  };

  return (
    <TextField
      fullWidth
      size="small"
      type="date"
      label={label}
      slotProps={{ inputLabel: { shrink: true } }}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      sx={{ minWidth: { xs: '100%', sm: 150 } }}
    />
  );
};
