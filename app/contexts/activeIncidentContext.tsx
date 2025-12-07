'use client';

import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface ActiveIncidentContextValue {
	activeIncidentId: string | null;
	setActiveIncidentId: Dispatch<SetStateAction<string | null>>;
	openIncident: (id: string) => void;
	closeIncident: () => void;
}

export const ActiveIncidentContext = createContext<ActiveIncidentContextValue | undefined>(undefined);

/**
 * Accessor for currently opened incident id and setter.
 * @returns Active incident id and open/close helpers.
 */
export const useActiveIncident = () => {
	const context = useContext(ActiveIncidentContext);
	if (!context) {
		throw new Error('useActiveIncident must be used within an IncidentProvider');
	}
	return context;
};
