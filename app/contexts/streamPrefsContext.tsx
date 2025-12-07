'use client';

import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface StreamPrefsContextValue {
	isStreamPaused: boolean;
	setIsStreamPaused: Dispatch<SetStateAction<boolean>>;
	muteLowWhileStreaming: boolean;
	setMuteLowWhileStreaming: Dispatch<SetStateAction<boolean>>;
}

export const StreamPrefsContext = createContext<StreamPrefsContextValue | undefined>(undefined);

/**
 * Accessor for stream preference state (pause/mute-low) persisted in localStorage.
 * @returns Stream preference state and setters.
 */
export const useIncidentStreamPrefs = (): StreamPrefsContextValue => {
	const context = useContext(StreamPrefsContext);
	if (!context) {
		throw new Error('useIncidentStreamPrefs must be used within an IncidentProvider');
	}
	return context;
};
