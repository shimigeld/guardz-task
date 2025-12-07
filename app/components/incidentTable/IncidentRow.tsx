"use client";

import { memo } from 'react';
import { Box, Checkbox, Chip, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { SEVERITY_COLORS, STATUS_COLORS, UNIFORM_CHIP_SX } from '@/app/utils/constants';
import { formatDateTime } from '@/app/utils/formatDate';
import type { Incident } from '@/types/incident';

export type IncidentRowProps = {
  incident: Incident;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onOpen: (id: string) => void;
  isNew: boolean;
};

/**
 * Single incident row with selection, tags, and highlighting for newly streamed items.
 * @param incident Incident data for the row.
 * @param selected Whether the row is selected.
 * @param onSelect Callback invoked when selection checkbox changes.
 * @param onOpen Callback when the row is clicked.
 * @param isNew Highlights the row if it is newly streamed.
 */
const IncidentRowComponent = ({ incident, selected, onSelect, onOpen, isNew }: IncidentRowProps) => (
  <TableRow
    hover
    selected={selected}
    sx={{
      cursor: 'pointer',
      bgcolor: isNew ? (theme) => alpha(theme.palette.success.main, 0.12) : undefined,
    }}
    onClick={() => onOpen(incident.id)}
  >
    <TableCell padding="checkbox">
      <Checkbox
        checked={selected}
        onChange={(e) => onSelect(incident.id, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
    </TableCell>
    <TableCell sx={{ minWidth: 96 }}>
      <Chip
        label={incident.severity}
        color={SEVERITY_COLORS[incident.severity]}
        size="small"
        sx={UNIFORM_CHIP_SX}
      />
    </TableCell>
    <TableCell sx={{ minWidth: 220 }}>
      <Stack spacing={0.5}>
        <Typography variant="body2" fontWeight={500}>
          {incident.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' } }}>
          {incident.account} • {incident.source}
        </Typography>
      </Stack>
    </TableCell>
    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{incident.account}</TableCell>
    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{incident.source}</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(incident.timestamp)}</TableCell>
    <TableCell>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Chip
          label={incident.status}
          color={STATUS_COLORS[incident.status]}
          size="small"
          variant="outlined"
          sx={UNIFORM_CHIP_SX}
        />
      </Stack>
    </TableCell>
    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {incident.tags.map((tag, idx) => (
          <Chip
            key={`${incident.id}-tag-${idx}`}
            label={tag}
            size="small"
            variant="outlined"
            sx={UNIFORM_CHIP_SX}
          />
        ))}
      </Box>
    </TableCell>
  </TableRow>
);

export const IncidentRow = memo(IncidentRowComponent);
IncidentRow.displayName = "IncidentRow";
