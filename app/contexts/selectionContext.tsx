'use client';

import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface SelectionContextValue {
	selectedIds: Set<string>;
	setSelectedIds: Dispatch<SetStateAction<Set<string>>>;
}

export const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

/**
 * Accessor for selected incident ids and setter helpers.
 * @returns Selected ids and setter.
 */
export const useIncidentSelection = () => {
	const context = useContext(SelectionContext);
	if (!context) {
		throw new Error('useIncidentSelection must be used within an IncidentProvider');
	}
	return context;
};
