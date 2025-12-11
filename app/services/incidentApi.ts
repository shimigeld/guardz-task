import { http } from './httpClient';
import type {
  Incident,
  IncidentFilters,
  IncidentsResponse,
} from '@/types/incident';

type IncidentQueryParams = Record<string, string | number | undefined>;

/**
 * Perform a GET request with optional params and abort support.
 */
const getRequest = async <T>(
  url: string,
  params?: IncidentQueryParams,
  signal?: AbortSignal,
): Promise<T> => {
  const { data } = await http.get<T>(url, { params, signal });
  return data;
};

/**
 * Fetch incidents with filters and pagination/sort options.
 */
export const fetchIncidentsApi = (
  filters: IncidentFilters & { limit?: number; offset?: number },
  signal?: AbortSignal,
) => {
  const params: IncidentQueryParams = {
    search: filters.search,
    severity: filters.severity,
    status: filters.status,
    account: filters.account,
    source: filters.source,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    limit: filters.limit,
    offset: filters.offset,
  };
  return getRequest<IncidentsResponse>('/', params, signal);
};

/**
 * Fetch a single incident by id.
 */
export const fetchIncidentDetailsApi = (id: string) =>
  getRequest<Incident>(`/${id}`);

/**
 * Fetch related incidents for a specific incident id.
 */
export const fetchRelatedIncidentsApi = (id: string) =>
  getRequest<{ related: Incident[] }>(`/${id}/related`);

/**
 * Patch status/owner/tags for an incident.
 */
export const patchIncidentApi = (
  incidentId: string,
  data: Partial<Pick<Incident, 'status' | 'owner' | 'tags'>>,
) => http.patch<Incident>(`/${incidentId}`, data).then((res) => res.data);

/**
 * Delete an incident by id.
 */
export const deleteIncidentApi = (incidentId: string) =>
  http.delete<{ id: string }>(`/${incidentId}`).then((res) => res.data);
