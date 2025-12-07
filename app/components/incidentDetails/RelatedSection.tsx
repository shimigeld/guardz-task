'use client';

import { Alert, Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { Incident } from '@/types/incident';
import { formatDateTime } from '@/app/utils/formatDate';
import { LoadingState } from '../common/LoadingState';

interface RelatedSectionProps {
  relatedIncidents: Incident[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  currentIncidentId?: string | null;
  onSelect: (id: string) => void;
}

export const RelatedSection = ({
  relatedIncidents,
  isLoading,
  isError,
  errorMessage,
  currentIncidentId,
  onSelect,
}: RelatedSectionProps) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>
      Related incidents
    </Typography>

    {isLoading ? (
      <LoadingState message="Loading related incidents..." minHeight={120} size={20} />
    ) : isError ? (
      <Alert severity="error">
        Failed to load related incidents{errorMessage ? `: ${errorMessage}` : '.'}
      </Alert>
    ) : relatedIncidents.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No related incidents found.
      </Typography>
    ) : (
      <List dense disablePadding>
        {relatedIncidents.map((related) => (
          <ListItemButton
            key={related.id}
            selected={related.id === currentIncidentId}
            onClick={() => onSelect(related.id)}
            divider
          >
            <ListItemText
              primary={related.title}
              secondary={`${related.severity} • ${formatDateTime(related.timestamp)}`}
            />
          </ListItemButton>
        ))}
      </List>
    )}
  </Box>
);
