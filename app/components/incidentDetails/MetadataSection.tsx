'use client';

import { Box, Typography } from '@mui/material';
import type { Incident } from '@/types/incident';
import { formatDateTime } from '@/app/utils/formatDate';

interface MetadataProps {
  incident: Incident;
}

export const MetadataSection = ({ incident }: MetadataProps) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>
      Metadata
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          Account / Tenant
        </Typography>
        <Typography variant="body1">{incident.account}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Source
        </Typography>
        <Typography variant="body1">{incident.source}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Owner
        </Typography>
        <Typography variant="body1">{incident.owner || 'Unassigned'}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Last Updated
        </Typography>
        <Typography variant="body1">{formatDateTime(incident.updatedAt)}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Created At
        </Typography>
        <Typography variant="body1">{formatDateTime(incident.createdAt)}</Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Detected At
        </Typography>
        <Typography variant="body1">{formatDateTime(incident.timestamp)}</Typography>
      </Box>
    </Box>
  </Box>
);
