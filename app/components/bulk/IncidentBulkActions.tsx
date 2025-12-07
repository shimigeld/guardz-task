"use client";

import { Button, Stack } from "@mui/material";
import { useIncidentData } from "@/contexts/incidentDataContext";
import { useIncidentSelection } from "@/contexts/selectionContext";
import { useIncidentBulkActionMutation } from "@/services/incidentService";
import type { IncidentBulkAction } from "@/types/incident";

/**
 * Bulk actions that apply resolve/delete to the current selection.
 * Resolve is disabled if every selected incident is already resolved.
 * @returns Buttons to resolve/delete selected incidents (hidden if nothing selected).
 */
export const IncidentBulkActions = () => {
	const { selectedIds, setSelectedIds } = useIncidentSelection();
	const { incidents, setIncidents } = useIncidentData();
	const bulkMutation = useIncidentBulkActionMutation(incidents, setIncidents);

	const hasSelection = selectedIds.size > 0;
	const selectedIncidents = incidents.filter((incident) => selectedIds.has(incident.id));
	const hasUnresolvedSelection = selectedIncidents.some((incident) => incident.status !== "Resolved");

  if (!hasSelection) {
    return null;
  }

	const handleAction = (action: IncidentBulkAction) => {
		const ids = Array.from(selectedIds);
		if (ids.length === 0) return;

		bulkMutation.mutate(
			{ ids, action },
			{
				onSuccess: () => {
					setSelectedIds(new Set());
				},
			}
		);
	};

	return (
		<Stack direction="row" spacing={1}>
			<Button
				variant="outlined"
				size="small"
				disabled={!hasSelection || bulkMutation.isPending || !hasUnresolvedSelection}
				onClick={() => handleAction("resolve")}
			>
				Resolve Selected
			</Button>
			<Button
				variant="outlined"
				size="small"
				color="secondary"
				disabled={!hasSelection || bulkMutation.isPending}
				onClick={() => handleAction("delete")}
			>
				Delete Selected
			</Button>
		</Stack>
	);
};
