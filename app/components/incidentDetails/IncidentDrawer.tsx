'use client';

import { useState } from 'react';
import { Alert, Box, Divider, Drawer, Stack } from '@mui/material';
import { useIncidentData } from '@/contexts/incidentDataContext';
import { useActiveIncident } from '@/contexts/activeIncidentContext';
import {
  useIncidentDetailsQuery,
  useIncidentUpdateMutation,
  useRelatedIncidentsQuery,
} from '@/services/incidentService';
import type { Incident } from '@/types/incident';
import { LoadingState } from '../common/LoadingState';
import { ActionsSection } from './ActionsSection';
import { DrawerHeader } from './DrawerHeader';
import { MetadataSection } from './MetadataSection';
import { RelatedSection } from './RelatedSection';
import { TimelineSection, type TimelineItem } from './TimelineSection';

const buildTimeline = (incident?: Incident): TimelineItem[] => {
  if (!incident) return [];

  const items: TimelineItem[] = [
    {
      label: 'Detected',
      timestamp: incident.timestamp,
      description: `Detected via ${incident.source}`,
    },
    {
      label: 'Created',
      timestamp: incident.createdAt,
      description: `Record created for ${incident.account}`,
    },
    {
      label: 'Updated',
      timestamp: incident.updatedAt,
      description: `Status is ${incident.status}`,
    },
  ];

  return items.filter((item) => Boolean(item.timestamp));
};

export const IncidentDrawer = () => {
  const { activeIncidentId, closeIncident, openIncident } = useActiveIncident();
  const { setIncidents } = useIncidentData();
  const isOpen = Boolean(activeIncidentId);

  const incidentQuery = useIncidentDetailsQuery(activeIncidentId);
  const relatedQuery = useRelatedIncidentsQuery(activeIncidentId);
  const mutation = useIncidentUpdateMutation(setIncidents);

  const incident = incidentQuery.data;
  const relatedIncidents = relatedQuery.data?.related ?? [];

  const [drafts, setDrafts] = useState<Record<string, { owner: string; tags: string[] }>>({});

  const ownerDraft = activeIncidentId
    ? drafts[activeIncidentId]?.owner ?? incident?.owner ?? ''
    : '';

  const tagsDraft = activeIncidentId
    ? drafts[activeIncidentId]?.tags ?? incident?.tags ?? []
    : ([] as string[]);

  const handleOwnerChange = (value: string) => {
    if (!activeIncidentId) return;
    setDrafts((prev) => ({
      ...prev,
      [activeIncidentId]: {
        owner: value,
        tags: prev[activeIncidentId]?.tags ?? tagsDraft,
      },
    }));
  };

  const timeline = buildTimeline(incident);

  const handleClose = () => {
    if (activeIncidentId) {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[activeIncidentId];
        return next;
      });
    }
    closeIncident();
  };

  const handleResolve = async () => {
    if (!activeIncidentId || incident?.status === 'Resolved') return;
    await mutation.mutateAsync({
      incidentId: activeIncidentId,
      data: { status: 'Resolved' },
    });
  };

  const handleAssignOwner = async () => {
    if (!activeIncidentId || ownerDraft === incident?.owner) return;
    await mutation.mutateAsync({
      incidentId: activeIncidentId,
      data: { owner: ownerDraft || undefined },
    });
    setDrafts((prev) => {
      if (!activeIncidentId) return prev;
      const next = { ...prev };
      delete next[activeIncidentId];
      return next;
    });
  };

  const handleUpdateTags = async (nextTags: string[]) => {
    if (!activeIncidentId) return;
    setDrafts((prev) => ({
      ...prev,
      [activeIncidentId]: {
        owner: prev[activeIncidentId]?.owner ?? ownerDraft,
        tags: nextTags,
      },
    }));
    const unchanged = incident
      ? incident.tags.length === nextTags.length &&
        incident.tags.every((tag, idx) => tag === nextTags[idx])
      : false;
    if (unchanged) return;
    await mutation.mutateAsync({
      incidentId: activeIncidentId,
      data: { tags: nextTags },
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480, md: 560 }, maxWidth: '100vw' } }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <DrawerHeader incident={incident ?? undefined} onClose={handleClose} isMutating={mutation.isPending} />

        {incidentQuery.isLoading ? (
          <LoadingState message="Loading incident details..." minHeight={240} />
        ) : incidentQuery.isError ? (
          <Alert severity="error">
            Failed to load incident details
            {incidentQuery.error instanceof Error ? `: ${incidentQuery.error.message}` : '.'}
          </Alert>
        ) : !incident ? (
          <Alert severity="warning">Incident not found.</Alert>
        ) : (
          <Stack spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
            {mutation.isError && <Alert severity="error">{mutation.error?.message}</Alert>}

            <MetadataSection incident={incident} />

            <Divider />

            <ActionsSection
              incident={incident}
              ownerDraft={ownerDraft}
              onOwnerChange={handleOwnerChange}
              onAssignOwner={handleAssignOwner}
              tagsDraft={tagsDraft}
              onTagsChange={handleUpdateTags}
              onResolve={handleResolve}
              isMutating={mutation.isPending}
            />

            <Divider />

            <TimelineSection timeline={timeline} />

            <Divider />

            <RelatedSection
              relatedIncidents={relatedIncidents}
              isLoading={relatedQuery.isLoading}
              isError={relatedQuery.isError}
              errorMessage={
                relatedQuery.error && relatedQuery.error instanceof Error
                  ? relatedQuery.error.message
                  : undefined
              }
              onSelect={openIncident}
              currentIncidentId={incident.id}
            />
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};
