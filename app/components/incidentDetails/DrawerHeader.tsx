'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Chip, IconButton, Stack, Typography } from '@mui/material';
import type { Incident } from '@/types/incident';

interface DrawerHeaderProps {
  incident?: Incident;
  onClose: () => void;
  isMutating?: boolean;
}

export const DrawerHeader = ({ incident, onClose, isMutating }: DrawerHeaderProps) => (
  <Stack direction="row" alignItems="flex-start" spacing={1} justifyContent="space-between">
    <Stack spacing={0.5} sx={{ flex: 1 }}>
      <Typography variant="h6">{incident?.title ?? 'Loading incident...'}</Typography>
      {incident && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip size="small" label={incident.status} variant="outlined" />
          <Chip size="small" label={incident.severity} />
          <Typography variant="body2" color="text.secondary">
            {incident.account} • {incident.source}
          </Typography>
        </Stack>
      )}
      {incident && (
        <Typography variant="body2" color="text.secondary">
          Incident ID: {incident.id}
        </Typography>
      )}
    </Stack>
    <IconButton
      aria-label="Close incident drawer"
      onClick={onClose}
      disabled={isMutating}
      edge="end"
      size="small"
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Stack>
);
