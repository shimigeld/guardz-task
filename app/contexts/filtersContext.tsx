'use client';

import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { IncidentFilters } from '@/types/incident';

export interface FiltersContextValue {
	filters: IncidentFilters;
	setFilters: Dispatch<SetStateAction<IncidentFilters>>;
}

export const FILTER_STORAGE_KEY = 'incidentFilters';

export const DEFAULT_FILTERS: IncidentFilters = {
	sortBy: 'timestamp',
	sortOrder: 'DESC',
};

export const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

/**
 * Accessor for filter state/context.
 * @returns Filters and setter from context.
 */
export const useIncidentFilters = () => {
	const context = useContext(FiltersContext);
	if (!context) {
		throw new Error('useIncidentFilters must be used within an IncidentProvider');
	}
	return context;
};

/**
 * Load filters from localStorage with defaults and safe parsing.
 * @returns Parsed filters merged with defaults.
 */
export const loadStoredFilters = (): IncidentFilters => {
	if (typeof window === 'undefined' || typeof window.localStorage?.getItem !== 'function') {
		return DEFAULT_FILTERS;
	}

	try {
		const storedValue = window.localStorage.getItem(FILTER_STORAGE_KEY);
		if (!storedValue) {
			return DEFAULT_FILTERS;
		}

		const parsed = JSON.parse(storedValue) as Partial<IncidentFilters>;
		return {
			...DEFAULT_FILTERS,
			...parsed,
		};
	} catch (error) {
		console.error('Failed to parse stored incident filters', error);
		return DEFAULT_FILTERS;
	}
};
