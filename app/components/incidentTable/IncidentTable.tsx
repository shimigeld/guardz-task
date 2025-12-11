"use client";

import { Alert, Paper, Snackbar, Table, TableBody, TableContainer } from '@mui/material';
import { LoadingState } from '../common/LoadingState';
import { IncidentRow } from './IncidentRow';
import { IncidentTableHeader } from './IncidentTableHeader';
import { TableEmptyState } from './TableEmptyState';
import { useIncidentTableData } from './useIncidentTableData';

export type SortField = 'timestamp' | 'severity';

/**
 * Main incident table wrapper: renders header, body rows, stream status, and new-incident toast.
 * Pulls all behavior from `useIncidentTableData` and delegates rendering to row/header components.
 * @returns Table element with incidents and stream/status affordances.
 */
export const IncidentTable = () => {
  const {
    incidents,
    isLoading,
    error,
    filters,
    selectedIds,
    newIncidentIds,
    showToast,
    setShowToast,
    handleToastNavigation,
    handleSort,
    handleSelectAll,
    handleSelectRow,
    handleRowClick,
    isAllSelected,
    isSomeSelected,
    streamStatus,
    lastStreamAt,
    streamAppliedCount,
    streamDroppedCount,
  } = useIncidentTableData();

	if (error) {
		return (
			<Alert severity="error">
				Failed to load incidents: {error instanceof Error ? error.message : 'Unknown error'}
			</Alert>
		);
	}

	const hasNewIncidents = newIncidentIds.size > 0;

	return (
		<TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
			<Table size="small">
				<IncidentTableHeader
					filters={filters}
					isAllSelected={isAllSelected}
					isSomeSelected={isSomeSelected}
					onSelectAll={handleSelectAll}
					onSort={handleSort}
				/>
				<TableBody>
					{isLoading ? (
						<LoadingState variant="table" message="Loading incidents..." columns={8} />
					) : incidents.length === 0 ? (
						<TableEmptyState />
					) : (
						incidents.map((incident) => (
							<IncidentRow
								key={incident.id}
								incident={incident}
								selected={selectedIds.has(incident.id)}
								onSelect={handleSelectRow}
								onOpen={handleRowClick}
								isNew={newIncidentIds.has(incident.id)}
							/>
						))
					)}
				</TableBody>
			</Table>

			<Snackbar
				open={showToast && hasNewIncidents}
				message={`${newIncidentIds.size} new incident${newIncidentIds.size === 1 ? '' : 's'}`}
				slotProps={{ root: { sx: { cursor: 'pointer' }, role: 'button', tabIndex: 0 } }}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				onClick={() => {
					handleToastNavigation();
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleToastNavigation();
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}
				}}
				onClose={() => setShowToast(false)}
			/>

			{streamStatus === 'error' && (
				<Alert severity="error" sx={{ mt: 1 }}>
					Live stream disconnected. Retrying shortly.
				</Alert>
			)}

			{streamStatus !== 'error' && streamStatus !== 'success' && (
				<Alert severity="info" sx={{ mt: 1 }}>
					Streaming status: {streamStatus}
				</Alert>
			)}

			{streamStatus === 'success' && lastStreamAt && (
				<Alert severity="success" sx={{ mt: 1 }}>
					Stream connected. Last event: {new Date(lastStreamAt).toLocaleTimeString()} — applied {streamAppliedCount}, dropped {streamDroppedCount} by filters
				</Alert>
			)}
		</TableContainer>
	);
};
