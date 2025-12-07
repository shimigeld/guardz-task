"use client";

import { Box, Stack, Typography } from '@mui/material';
import { SearchBar } from '../filters/SearchBar';
import { IncidentFiltersBar } from '../filters/IncidentFiltersBar';
import { IncidentBulkActions } from '../bulk/IncidentBulkActions';
import { StreamControls } from './StreamControls';
import { useIncidentData } from '@/contexts/incidentDataContext';

/**
 * Page header showing totals along with search, stream controls, filters, and bulk actions.
 * @returns Header stack with title, total count, and controls.
 */
export const IncidentHeader = () => {
	const { total } = useIncidentData();

	return (
		<Stack spacing={2}>
			<Box>
				<Typography variant="h4" gutterBottom>
					Incidents
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Total: {total} incident{total !== 1 ? 's' : ''}
				</Typography>
			</Box>

			<SearchBar />

			<StreamControls />

			<IncidentFiltersBar />

			<IncidentBulkActions />
		</Stack>
	);
};
