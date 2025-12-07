'use client';

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { Incident, IncidentFilters } from '@/types/incident';
import { useIncidentData } from '@/contexts/incidentDataContext';
import { useIncidentFilters } from '@/contexts/filtersContext';

type FilterLabel = 'Severity' | 'Status' | 'Account' | 'Source';
type FilterKey = 'severity' | 'status' | 'account' | 'source';
type SeverityOption = 'Critical' | 'High' | 'Med' | 'Low';
type StatusOption = 'Open' | 'Investigating' | 'Resolved';

const STATIC_SEVERITY_OPTIONS: readonly SeverityOption[] = ['Critical', 'High', 'Med', 'Low'];
const STATIC_STATUS_OPTIONS: readonly StatusOption[] = ['Open', 'Investigating', 'Resolved'];

type FilterConfig = {
  key: FilterKey;
  getOptions: (incidents: Incident[]) => string[];
};

const FILTER_CONFIG: Record<FilterLabel, FilterConfig> = {
  Severity: {
    key: 'severity',
    getOptions: () => [...STATIC_SEVERITY_OPTIONS],
  },
  Status: {
    key: 'status',
    getOptions: () => [...STATIC_STATUS_OPTIONS],
  },
  Account: {
    key: 'account',
    getOptions: (incidents) => [...new Set(incidents.map((incident) => incident.account))].sort(),
  },
  Source: {
    key: 'source',
    getOptions: (incidents) => [...new Set(incidents.map((incident) => incident.source))].sort(),
  },
};

interface SelectFilterProps {
  label: FilterLabel;
}

/**
 * Generic select filter backed by incident data for dynamic options (account/source) and static options for severity/status.
 * @param label Filter label determining the key/options.
 * @returns Select control bound to incident filters context.
 */
export const SelectFilter = ({ label }: SelectFilterProps) => {
  const { filters, setFilters } = useIncidentFilters();
  const { incidents } = useIncidentData();
  const { key, getOptions } = FILTER_CONFIG[label];

  const options = getOptions(incidents);
  const value = filters[key] || '';

  const handleChange = (nextValue: string) => {
    const normalized = nextValue || undefined;
    setFilters((prev: IncidentFilters) => {
      if (prev[key] === normalized) {
        return prev;
      }
      return { ...prev, [key]: normalized };
    });
  };

  return (
    <FormControl size="small" fullWidth sx={{ minWidth: { xs: '100%', sm: 150 } }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={(e) => handleChange(e.target.value)}>
        <MenuItem value="">All</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
