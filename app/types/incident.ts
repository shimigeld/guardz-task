export interface Incident {
  id: string;
  severity: 'Critical' | 'High' | 'Med' | 'Low';
  title: string;
  account: string;
  source: string;
  timestamp: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  tags: string[];
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentFilters {
  search?: string;
  severity?: string;
  status?: string;
  account?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'timestamp' | 'severity';
  sortOrder?: 'ASC' | 'DESC';
}

export interface TableState {
  limit: number;
  offset: number;
}

export interface IncidentsResponse {
  incidents: Incident[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface IncidentFilterOptions {
  severities: string[];
  statuses: string[];
  accounts: string[];
  sources: string[];
}

export type IncidentBulkAction = 'resolve' | 'investigate' | 'delete';
