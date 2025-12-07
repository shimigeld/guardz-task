'use client';

import { Box, Stack } from '@mui/material';
import { IncidentHeader } from './layout/IncidentHeader';
import { IncidentTable } from './incidentTable/IncidentTable';
import { IncidentDrawer } from './incidentDetails/IncidentDrawer';
import { IncidentProvider } from '@/contexts/IncidentContext';

export const IncidentManager = () => {
  return (
    <IncidentProvider>
      <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 }, maxWidth: 1440, mx: 'auto' }}>
        <Stack spacing={3}>
          <IncidentHeader />
          <Stack spacing={2}>
            <IncidentTable />
          </Stack>
        </Stack>
        <IncidentDrawer />
      </Box>
    </IncidentProvider>
  );
};
