'use client';

import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { formatDateTime } from '@/app/utils/formatDate';

export interface TimelineItem {
  label: string;
  timestamp?: string;
  description: string;
}

interface TimelineSectionProps {
  timeline: TimelineItem[];
}

export const TimelineSection = ({ timeline }: TimelineSectionProps) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>
      Timeline
    </Typography>
    {timeline.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        No timeline data available.
      </Typography>
    ) : (
      <List dense>
        {timeline.map((event, index) => (
          <ListItem key={`timeline-${index}`} sx={{ py: 0 }}>
            <ListItemText
              primary={`${event.label} — ${formatDateTime(event.timestamp)}`}
              secondary={event.description}
            />
          </ListItem>
        ))}
      </List>
    )}
  </Box>
);
