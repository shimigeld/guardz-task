import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import type { Incident, IncidentFilters } from '@/types/incident';
import { useActiveIncident } from '@/contexts/activeIncidentContext';
import { useIncidentData } from '@/contexts/incidentDataContext';
import { useIncidentFilters } from '@/contexts/filtersContext';
import { useIncidentSelection } from '@/contexts/selectionContext';
import { useIncidentStreamPrefs } from '@/contexts/streamPrefsContext';
import { useIncidentTableState } from '@/contexts/tableStateContext';
import {
  useIncidentStream,
  useIncidentsQuery,
} from '@/services/incidentService';
import type { SortField } from './IncidentTable';

/**
 * Centralized hook for incident table state: fetches/query state, stream handling (queue, mute, filters),
 * selection, sorting, and the new-incident toast logic tied to scroll position.
 * @returns Table data state, handlers, and stream metadata used by the table component.
 */
export const useIncidentTableData = () => {
  const { filters, setFilters } = useIncidentFilters();
  const { incidents, setIncidents, setTotal } = useIncidentData();
  const { isStreamPaused, muteLowWhileStreaming } = useIncidentStreamPrefs();
  const { tableState } = useIncidentTableState();
  const { selectedIds, setSelectedIds } = useIncidentSelection();
  const { openIncident } = useActiveIncident();
  const [, startSelecting] = useTransition();
  const { data, isLoading, error } = useIncidentsQuery({
    ...filters,
    ...tableState,
  });
  const queryIncidents = useMemo(
    () => data?.incidents || [],
    [data?.incidents],
  );
  const queryTotal = data?.total || 0;
  const [newIncidentIds, setNewIncidentIds] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [lastStreamAt, setLastStreamAt] = useState<number | null>(null);
  const [streamAppliedCount, setStreamAppliedCount] = useState(0);
  const [streamDroppedCount, setStreamDroppedCount] = useState(0);
  const isAtTopRef = useRef(true);
  const showToastRef = useRef(false);
  const streamQueueRef = useRef<Incident[]>([]);
  const streamOrderRef = useRef<string[]>([]);

  const matchesActiveFilters = useCallback(
    (incident: Incident) => {
      if (filters.severity && incident.severity !== filters.severity)
        return false;
      if (filters.status && incident.status !== filters.status) return false;
      if (filters.account && incident.account !== filters.account) return false;
      if (filters.source && incident.source !== filters.source) return false;

      if (filters.startDate || filters.endDate) {
        const incidentTime = new Date(incident.timestamp).getTime();
        if (Number.isNaN(incidentTime)) return false;

        if (filters.startDate) {
          const startTime = new Date(`${filters.startDate}T00:00:00`).getTime();
          if (!Number.isNaN(startTime) && incidentTime < startTime)
            return false;
        }

        if (filters.endDate) {
          const endTime = new Date(`${filters.endDate}T23:59:59.999`).getTime();
          if (!Number.isNaN(endTime) && incidentTime > endTime) return false;
        }
      }

      if (filters.search) {
        const term = filters.search.toLowerCase();
        const text =
          `${incident.title} ${incident.account} ${incident.source}`.toLowerCase();
        if (!text.includes(term)) return false;
      }

      return true;
    },
    [filters],
  );

  const showToastIfAwayFromTop = useCallback(() => {
    if (!isAtTopRef.current) {
      setShowToast(true);
    }
  }, []);

  const processIncident = useCallback(
    (incident: Incident) => {
      if (!matchesActiveFilters(incident)) {
        setStreamDroppedCount((prev) => prev + 1);
        return;
      }
      setIncidents((prev: Incident[]) => {
        const exists = prev.some((item) => item.id === incident.id);
        if (exists) return prev;
        streamOrderRef.current = [
          incident.id,
          ...streamOrderRef.current.filter((id) => id !== incident.id),
        ];
        return [incident, ...prev];
      });
      setTotal((prev: number) => prev + 1);
      setNewIncidentIds((prev) => {
        const next = new Set(prev);
        next.add(incident.id);
        return next;
      });
      setStreamAppliedCount((prev) => prev + 1);
      showToastIfAwayFromTop();
    },
    [matchesActiveFilters, setIncidents, setTotal, showToastIfAwayFromTop],
  );

  const streamQuery = useIncidentStream(
    useCallback(
      (incident) => {
        if (muteLowWhileStreaming && incident.severity === 'Low') return;

        if (isStreamPaused) {
          streamQueueRef.current.push(incident);
          return;
        }

        processIncident(incident);
        setLastStreamAt(Date.now());
      },
      [isStreamPaused, muteLowWhileStreaming, processIncident],
    ),
  );

  useEffect(() => {
    if (!isStreamPaused && streamQueueRef.current.length > 0) {
      const queued = [...streamQueueRef.current];
      streamQueueRef.current = [];
      queued.forEach(processIncident);
    }
  }, [isStreamPaused, processIncident]);

  useEffect(() => {
    setIncidents(() => {
      // Keep stream-inserted incidents at the top in their arrival order when still present in query results.
      const queryById = new Map(
        queryIncidents.map((item) => [item.id, item] as const),
      );
      const streamItems = streamOrderRef.current
        .map((id) => queryById.get(id))
        .filter((item): item is Incident => Boolean(item))
        .filter((item) => matchesActiveFilters(item));

      const streamIds = new Set(streamItems.map((item) => item.id));
      const merged = [
        ...streamItems,
        ...queryIncidents.filter((item) => !streamIds.has(item.id)),
      ];

      const extraCount = merged.length - queryIncidents.length;
      setTotal(queryTotal + extraCount);

      // Drop stream order entries that no longer exist.
      streamOrderRef.current = streamOrderRef.current.filter((id) =>
        queryById.has(id),
      );

      return merged;
    });
  }, [
    queryIncidents,
    queryTotal,
    setIncidents,
    setTotal,
    matchesActiveFilters,
  ]);

  const clearNewIncidentHighlights = useCallback(() => {
    setNewIncidentIds(new Set());
    setShowToast(false);
  }, []);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    const handleScroll = () => {
      const atTop = window.scrollY < 16;
      isAtTopRef.current = atTop;
      if (atTop && showToastRef.current) {
        clearNewIncidentHighlights();
      }
    };

    handleScroll(); // initialize position so toast logic has correct baseline
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [clearNewIncidentHighlights]);

  const handleSort = useCallback(
    (field: SortField) => {
      setFilters((prev: IncidentFilters) => {
        const isAsc = prev.sortBy === field && prev.sortOrder === 'ASC';
        return {
          ...prev,
          sortBy: field,
          sortOrder: isAsc ? 'DESC' : 'ASC',
        };
      });
    },
    [setFilters],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      startSelecting(() => {
        setSelectedIds(() =>
          checked ? new Set(incidents.map((i: Incident) => i.id)) : new Set(),
        );
      });
    },
    [incidents, setSelectedIds],
  );

  const handleSelectRow = useCallback(
    (id: string, checked: boolean) => {
      startSelecting(() => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (checked) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
      });
    },
    [setSelectedIds],
  );

  const handleRowClick = useCallback(
    (id: string) => {
      openIncident(id);
    },
    [openIncident],
  );

  const isAllSelected =
    incidents.length > 0 && selectedIds.size === incidents.length;
  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < incidents.length;

  return {
    incidents,
    isLoading,
    error,
    filters,
    selectedIds,
    newIncidentIds,
    showToast,
    setShowToast,
    clearNewIncidentHighlights,
    handleSort,
    handleSelectAll,
    handleSelectRow,
    handleRowClick,
    isAllSelected,
    isSomeSelected,
    streamStatus: streamQuery.status,
    lastStreamAt,
    streamAppliedCount,
    streamDroppedCount,
  };
};
