'use client';

import { useMemo } from 'react';
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import type { Incident } from '@/types/incident';

interface ActionsSectionProps {
  incident: Incident;
  ownerDraft: string;
  onOwnerChange: (value: string) => void;
  onAssignOwner: () => Promise<void> | void;
  tagsDraft: string[];
  onTagsChange: (tags: string[]) => Promise<void> | void;
  onResolve: () => Promise<void> | void;
  isMutating?: boolean;
}

export const ActionsSection = ({
  incident,
  ownerDraft,
  onOwnerChange,
  onAssignOwner,
  tagsDraft,
  onTagsChange,
  onResolve,
  isMutating,
}: ActionsSectionProps) => {
  const tagInput = useMemo(() => tagsDraft.join(', '), [tagsDraft]);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Actions
      </Typography>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="contained"
            color="success"
            disabled={incident.status === 'Resolved' || isMutating}
            onClick={onResolve}
            fullWidth
            sx={{ maxWidth: { sm: 180 } }}
          >
            Mark as resolved
          </Button>
          <Button
            variant="outlined"
            disabled={ownerDraft === incident.owner || isMutating}
            onClick={onAssignOwner}
            fullWidth
            sx={{ maxWidth: { sm: 180 } }}
          >
            Assign owner
          </Button>
        </Stack>

        <TextField
          label="Owner"
          size="small"
          value={ownerDraft}
          onChange={(event) => onOwnerChange(event.target.value)}
          disabled={isMutating}
        />

        <TextField
          label="Tags (comma separated)"
          size="small"
          value={tagInput}
          onChange={(event) =>
            onTagsChange(
              event.target.value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
          disabled={isMutating}
        />

        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(tagsDraft.length ? tagsDraft : incident.tags || []).map((tag) => (
            <Chip key={`${incident.id}-tag-${tag}`} label={tag} size="small" />
          ))}
          {tagsDraft.length === 0 && incident.tags.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No tags
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
