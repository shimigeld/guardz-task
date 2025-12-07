
'use client';

import { useEffect, useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useIncidentFilters } from '@/contexts/filtersContext';
import type { IncidentFilters } from '@/types/incident';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type SearchBarProps = {
	debounceMs?: number;
};

export const SearchBar = ({ debounceMs = 500 }: SearchBarProps) => {
  const { filters, setFilters } = useIncidentFilters();
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebouncedValue(searchValue, debounceMs);

  useEffect(() => {
    const syncedValue = filters.search ?? '';
    if (syncedValue !== searchValue) {
      setSearchValue(syncedValue);
    }
    // Only re-sync when the external filter changes, not on local typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  useEffect(() => {
    setFilters((prev: IncidentFilters) => {
      const nextSearch = debouncedSearch.trim();
      if (prev.search === nextSearch || (!nextSearch && !prev.search)) {
        return prev;
      }
      return { ...prev, search: nextSearch || undefined };
    });
  }, [debouncedSearch, setFilters]);

  const handleClear = () => {
    setSearchValue('');
    setFilters((prev: IncidentFilters) => {
      if (!prev.search) return prev;
      return { ...prev, search: undefined };
    });
  };

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search incidents..."
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} aria-label="Clear search">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{ width: { xs: '100%', md: 400 } }}
    />
  );
};
