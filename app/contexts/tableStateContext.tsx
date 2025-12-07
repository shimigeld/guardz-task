'use client';

import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { TableState } from '@/types/incident';

export interface TableStateContextValue {
	tableState: TableState;
	setTableState: Dispatch<SetStateAction<TableState>>;
}

export const DEFAULT_TABLE_STATE: TableState = {
	limit: 200,
	offset: 0,
};

export const TableStateContext = createContext<TableStateContextValue | undefined>(undefined);

/**
 * Accessor for pagination/sort state used by the table data hook.
 * @returns Table state and setter.
 */
export const useIncidentTableState = () => {
	const context = useContext(TableStateContext);
	if (!context) {
		throw new Error('useIncidentTableState must be used within an IncidentProvider');
	}
	return context;
};
