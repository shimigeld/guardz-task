'use client';

import { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import type { Incident, IncidentFilters, TableState } from '@/types/incident';
import { ActiveIncidentContext } from './activeIncidentContext';
import { FiltersContext, FILTER_STORAGE_KEY, loadStoredFilters } from './filtersContext';
import { IncidentDataContext } from './incidentDataContext';
import { SelectionContext } from './selectionContext';
import { StreamPrefsContext } from './streamPrefsContext';
import { TableStateContext, DEFAULT_TABLE_STATE } from './tableStateContext';

interface IncidentProviderProps {
	children: ReactNode;
}

const loadStreamPrefs = () => {
  if (typeof window === 'undefined' || typeof window.localStorage?.getItem !== 'function') {
    return { paused: false, mute: false };
  }

  try {
    const raw = window.localStorage.getItem('streamPrefs');
    if (raw) {
      // On load, force both pause and mute off to guarantee stream visibility after reloads.
      return { paused: false, mute: false };
    }
  } catch (error) {
    console.error('Failed to load stream preferences', error);
  }

  return { paused: false, mute: false };
};

/**
 * Root provider composing filters, table state, selection, incident data, stream prefs, and active incident.
 * @param children React subtree to wrap with context providers.
 */
export const IncidentProvider = ({ children }: IncidentProviderProps) => {
  const [filters, setFilters] = useState<IncidentFilters>(loadStoredFilters);
  const [tableState, setTableState] = useState<TableState>(DEFAULT_TABLE_STATE);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const { paused: initialPaused, mute: initialMute } = loadStreamPrefs();
  const [isStreamPaused, setIsStreamPaused] = useState(initialPaused);
  const [muteLowWhileStreaming, setMuteLowWhileStreaming] = useState(initialMute);

  useEffect(() => {
  if (typeof window === 'undefined' || typeof window.localStorage?.setItem !== 'function') {
    return;
  }

  try {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Failed to persist incident filters', error);
  }
  }, [filters]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.localStorage?.setItem !== 'function') return;
    try {
      window.localStorage.setItem(
        'streamPrefs',
        JSON.stringify({ isStreamPaused, muteLowWhileStreaming })
      );
    } catch (error) {
      console.error('Failed to persist stream preferences', error);
    }
  }, [isStreamPaused, muteLowWhileStreaming]);

  const openIncident = useCallback((id: string) => setActiveIncidentId(id), []);
  const closeIncident = useCallback(() => setActiveIncidentId(null), []);

  const filtersValue = useMemo(() => ({ filters, setFilters }), [filters]);

  const streamPrefsValue = useMemo(
    () => ({ isStreamPaused, setIsStreamPaused, muteLowWhileStreaming, setMuteLowWhileStreaming }),
    [isStreamPaused, muteLowWhileStreaming]
  );

  const tableStateValue = useMemo(() => ({ tableState, setTableState }), [tableState]);

  const incidentDataValue = useMemo(
    () => ({ incidents, setIncidents, total, setTotal }),
    [incidents, total]
  );

  const selectionValue = useMemo(() => ({ selectedIds, setSelectedIds }), [selectedIds]);

  const activeIncidentValue = useMemo(
    () => ({ activeIncidentId, setActiveIncidentId, openIncident, closeIncident }),
    [activeIncidentId, openIncident, closeIncident]
  );

  return (
    <FiltersContext.Provider value={filtersValue}>
      <StreamPrefsContext.Provider value={streamPrefsValue}>
        <TableStateContext.Provider value={tableStateValue}>
          <IncidentDataContext.Provider value={incidentDataValue}>
            <SelectionContext.Provider value={selectionValue}>
              <ActiveIncidentContext.Provider value={activeIncidentValue}>{children}</ActiveIncidentContext.Provider>
            </SelectionContext.Provider>
          </IncidentDataContext.Provider>
        </TableStateContext.Provider>
      </StreamPrefsContext.Provider>
    </FiltersContext.Provider>
  );
};

// Note: slice hooks now live in their respective files; import them directly where needed.

