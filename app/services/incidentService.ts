import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  fetchIncidentsApi,
  fetchIncidentDetailsApi,
  fetchRelatedIncidentsApi,
  patchIncidentApi,
  deleteIncidentApi,
} from './incidentApi';
import type {
  Incident,
  IncidentFilters,
  TableState,
  IncidentsResponse,
  IncidentBulkAction,
} from '@/types/incident';

// Add the missing alias for shared filters/table state
type IncidentQueryFilters = IncidentFilters & TableState;

/**
 * Stable query keys for incidents, related incidents, and stream queries.
 */
const queryKeys = {
  incidents: (filters: IncidentQueryFilters) => ['incidents', filters] as const,
  incident: (id?: string | null) => ['incident', id] as const,
  related: (id?: string | null) => ['incident-related', id] as const,
  stream: ['incident-stream'] as const,
};

/**
 * Fetch incidents with filters and table state encoded as query params.
 */
const fetchIncidents = async (
  filters: IncidentQueryFilters,
  signal?: AbortSignal,
): Promise<IncidentsResponse> => {
  try {
    return await fetchIncidentsApi(filters, signal);
  } catch {
    throw new Error('Failed to fetch incidents');
  }
};

/**
 * Fetch a single incident by id.
 * @param id Incident id to retrieve.
 */
const fetchIncidentDetails = async (id: string): Promise<Incident> => {
  try {
    return await fetchIncidentDetailsApi(id);
  } catch {
    throw new Error('Failed to fetch incident');
  }
};

/**
 * Fetch related incidents for an id.
 * @param id Incident id whose related records to fetch.
 */
const fetchRelatedIncidents = async (
  id: string,
): Promise<{ related: Incident[] }> => {
  try {
    return await fetchRelatedIncidentsApi(id);
  } catch {
    throw new Error('Failed to fetch related incidents');
  }
};

/**
 * Patch an incident's status/owner/tags.
 * @param incidentId Target incident id.
 * @param data Partial fields to update (status/owner/tags).
 */
const patchIncident = async (
  incidentId: string,
  data: Partial<Pick<Incident, 'status' | 'owner' | 'tags'>>,
): Promise<Incident> => {
  try {
    return await patchIncidentApi(incidentId, data);
  } catch (_error) {
    throw new Error('Failed to update incident');
  }
};

/**
 * Delete an incident by id.
 * @param incidentId Target incident id.
 */
const deleteIncident = async (incidentId: string): Promise<{ id: string }> => {
  try {
    return await deleteIncidentApi(incidentId);
  } catch (_error) {
    throw new Error('Failed to delete incident');
  }
};

/**
 * Merge partial incident fields while preserving typed status/owner/tags.
 */
const mergeIncident = (
  target: Incident,
  patch: Partial<Incident>,
): Incident => ({
  ...target,
  ...patch,
  tags: (patch.tags ?? target.tags) as string[],
  owner: patch.owner ?? target.owner,
  status: (patch.status ?? target.status) as Incident['status'],
});

/**
 * Query hook for incident list with filters/state.
 */
export const useIncidentsQuery = (filters: IncidentQueryFilters) =>
  useQuery({
    queryKey: queryKeys.incidents(filters),
    queryFn: ({ signal }) => fetchIncidents(filters, signal),
  });

/**
 * Query hook for a single incident by id (enabled when id provided).
 */
export const useIncidentDetailsQuery = (incidentId?: string | null) =>
  useQuery<Incident>({
    queryKey: queryKeys.incident(incidentId),
    enabled: Boolean(incidentId),
    queryFn: () => {
      if (!incidentId) {
        throw new Error('Incident id is required');
      }
      return fetchIncidentDetails(incidentId);
    },
  });

/**
 * Query hook for related incidents (enabled when id provided).
 */
export const useRelatedIncidentsQuery = (incidentId?: string | null) =>
  useQuery<{ related: Incident[] }>({
    queryKey: queryKeys.related(incidentId),
    enabled: Boolean(incidentId),
    queryFn: () => {
      if (!incidentId) {
        throw new Error('Incident id is required');
      }
      return fetchRelatedIncidents(incidentId);
    },
  });

/**
 * Mutation hook to patch an incident with optimistic cache updates for list and detail queries.
 */
export const useIncidentUpdateMutation = (
  setIncidents: (updater: (prev: Incident[]) => Incident[]) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Incident,
    Error,
    {
      incidentId: string;
      data: Partial<Pick<Incident, 'status' | 'owner' | 'tags'>>;
    },
    { previousIncident?: Incident }
  >({
    mutationFn: ({ incidentId, data }) => patchIncident(incidentId, data),
    onMutate: async ({ incidentId, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.incident(incidentId),
      });
      const previousIncident = queryClient.getQueryData<Incident>(
        queryKeys.incident(incidentId),
      );

      if (previousIncident) {
        const optimisticIncident = mergeIncident(previousIncident, data);
        queryClient.setQueryData(
          queryKeys.incident(incidentId),
          optimisticIncident,
        );
        queryClient.setQueriesData(
          { queryKey: ['incidents'] },
          (old?: IncidentsResponse) => {
            if (!old) return old;
            return {
              ...old,
              incidents: old.incidents.map((incident) =>
                incident.id === incidentId
                  ? mergeIncident(incident, data)
                  : incident,
              ),
            };
          },
        );
        setIncidents((prev) =>
          prev.map((incident) =>
            incident.id === incidentId
              ? mergeIncident(incident, data)
              : incident,
          ),
        );
      }

      return { previousIncident };
    },
    onError: (_error, variables, context) => {
      if (!context?.previousIncident) {
        return;
      }

      const fallback = context.previousIncident;
      queryClient.setQueryData(queryKeys.incident(fallback.id), fallback);
      queryClient.setQueriesData(
        { queryKey: ['incidents'] },
        (old?: IncidentsResponse) => {
          if (!old) return old;
          return {
            ...old,
            incidents: old.incidents.map((incident) =>
              incident.id === fallback.id ? fallback : incident,
            ),
          };
        },
      );
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === fallback.id ? fallback : incident,
        ),
      );
    },
    onSuccess: (updatedIncident) => {
      queryClient.setQueryData(
        queryKeys.incident(updatedIncident.id),
        updatedIncident,
      );
      queryClient.setQueriesData(
        { queryKey: ['incidents'] },
        (old?: IncidentsResponse) => {
          if (!old) return old;
          return {
            ...old,
            incidents: old.incidents.map((incident) =>
              incident.id === updatedIncident.id ? updatedIncident : incident,
            ),
          };
        },
      );
      setIncidents((prev) =>
        prev.map((incident) =>
          incident.id === updatedIncident.id ? updatedIncident : incident,
        ),
      );
    },
    onSettled: (_data, _error, variables) => {
      if (!variables?.incidentId) {
        return;
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.incident(variables.incidentId),
      });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

/**
 * Mutation hook for bulk resolve/investigate/delete operations with optimistic updates and rollback.
 */
export const useIncidentBulkActionMutation = (
  incidentsSnapshot: Incident[],
  setIncidents: (updater: (prev: Incident[]) => Incident[]) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Incident[] | { id: string }[],
    Error,
    { ids: string[]; action: IncidentBulkAction },
    {
      previousLists: Array<[unknown, IncidentsResponse | undefined]>;
      previousById: Record<string, Incident | undefined>;
      previousState: Incident[];
    }
  >({
    mutationFn: async ({ ids, action }) => {
      if (ids.length === 0) return [];

      if (action === 'delete') {
        return Promise.all(ids.map((id) => deleteIncident(id)));
      }

      const status = action === 'resolve' ? 'Resolved' : 'Investigating';
      return Promise.all(ids.map((id) => patchIncident(id, { status })));
    },
    onMutate: async ({ ids, action }) => {
      await queryClient.cancelQueries({
        queryKey: ['incidents'],
        exact: false,
      });

      const previousLists = queryClient.getQueriesData<IncidentsResponse>({
        queryKey: ['incidents'],
      });
      const previousById: Record<string, Incident | undefined> = {};
      ids.forEach((id) => {
        const prev = queryClient.getQueryData<Incident>(queryKeys.incident(id));
        if (prev) previousById[id] = prev;
      });

      const applyTransform = (incident: Incident): Incident | null => {
        if (action === 'delete') {
          return null;
        }
        const status = action === 'resolve' ? 'Resolved' : 'Investigating';
        return mergeIncident(incident, { status });
      };

      queryClient.setQueriesData(
        { queryKey: ['incidents'], exact: false },
        (old?: IncidentsResponse) => {
          if (!old) return old;
          const transformed = old.incidents
            .map((incident) =>
              ids.includes(incident.id) ? applyTransform(incident) : incident,
            )
            .filter((item): item is Incident => Boolean(item));
          const removedCount = old.incidents.length - transformed.length;
          return {
            ...old,
            incidents: transformed,
            total: old.total - removedCount,
          };
        },
      );

      ids.forEach((id) => {
        const prev = queryClient.getQueryData<Incident>(queryKeys.incident(id));
        if (!prev) return;
        const next = applyTransform(prev);
        if (next) {
          queryClient.setQueryData(queryKeys.incident(id), next);
        } else {
          queryClient.removeQueries({ queryKey: queryKeys.incident(id) });
        }
      });

      setIncidents((prev) => {
        const transformed = prev
          .map((incident) =>
            ids.includes(incident.id) ? applyTransform(incident) : incident,
          )
          .filter((item): item is Incident => Boolean(item));
        return transformed;
      });

      return { previousLists, previousById, previousState: incidentsSnapshot };
    },
    onError: (_error, variables, context) => {
      if (!context) return;

      context.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey as readonly unknown[], data);
      });

      Object.entries(context.previousById).forEach(([id, incident]) => {
        queryClient.setQueryData(queryKeys.incident(id), incident);
      });

      setIncidents(() => context.previousState);
    },
    onSuccess: (updated) => {
      // Sync per-incident queries with server responses when available
      if (Array.isArray(updated)) {
        updated.forEach((item) => {
          if (!('id' in item)) return;
          const existing = queryClient.getQueryData<Incident>(
            queryKeys.incident(item.id),
          );
          if (existing) {
            queryClient.setQueryData(queryKeys.incident(item.id), {
              ...existing,
              ...item,
            });
          }
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'], exact: false });
    },
  });
};

/**
 * Streaming query using EventSource; hooks incident handler, queues, and refetch triggers on new events.
 */
export const useIncidentStream = (onIncident: (incident: Incident) => void) => {
  const queryClient = useQueryClient();
  const streamRef = useRef<EventSource | null>(null);
  const handlerRef = useRef(onIncident);

  useEffect(() => {
    handlerRef.current = onIncident;
  }, [onIncident]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
        streamRef.current = null;
      }
    };
  }, []);

  return useQuery({
    queryKey: queryKeys.stream,
    queryFn: () =>
      new Promise<null>((resolve, reject) => {
        if (streamRef.current) {
          resolve(null);
          return;
        }

        const eventSource = new EventSource('/api/incidents/stream');
        streamRef.current = eventSource;

        eventSource.onopen = () => resolve(null);
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            const eventType = parsed?.type;

            const incidents: Incident[] = Array.isArray(parsed?.incidents)
              ? (parsed.incidents as Incident[])
              : parsed?.id
                ? [parsed as Incident]
                : [];

            incidents.forEach((incident) => {
              handlerRef.current?.(incident);

              queryClient.setQueriesData(
                { queryKey: ['incidents'], exact: false },
                (old?: IncidentsResponse) => {
                  if (!old) return old;
                  if (
                    old.incidents.some(
                      (existing) => existing.id === incident.id,
                    )
                  ) {
                    return old;
                  }
                  return {
                    ...old,
                    incidents: [incident, ...old.incidents],
                    total: (old.total ?? 0) + 1,
                  };
                },
              );
            });

            if (eventType === 'new_incidents' || incidents.length > 0) {
              queryClient.refetchQueries({
                queryKey: ['incidents'],
                exact: false,
                type: 'active',
              });
            }
          } catch (error) {
            console.error('Failed to parse incident stream event', error);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          streamRef.current = null;
          reject(new Error('Incident stream disconnected'));
        };
      }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: true,
  });
};
