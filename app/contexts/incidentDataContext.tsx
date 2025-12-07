'use client';

import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Incident } from '@/types/incident';

export interface IncidentDataContextValue {
	incidents: Incident[];
	setIncidents: Dispatch<SetStateAction<Incident[]>>;
	total: number;
	setTotal: Dispatch<SetStateAction<number>>;
}

export const IncidentDataContext = createContext<IncidentDataContextValue | undefined>(undefined);

/**
 * Accessor for incident data and total count held at the app level.
 * @returns Incident array, total count, and setters.
 */
export const useIncidentData = () => {
	const context = useContext(IncidentDataContext);
	if (!context) {
		throw new Error('useIncidentData must be used within an IncidentProvider');
	}
	return context;
};
