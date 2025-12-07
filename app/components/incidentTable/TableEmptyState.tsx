"use client";

import { TableCell, TableRow, Typography } from '@mui/material';

interface TableEmptyStateProps {
  columns?: number;
  message?: string;
}

/**
 * Simple empty-state row that spans the table and shows a friendly message.
 * @param columns Column span for the empty cell.
 * @param message Message to display when there are no incidents.
 */
export const TableEmptyState = ({ columns = 8, message = 'No incidents found' }: TableEmptyStateProps) => (
  <TableRow>
    <TableCell colSpan={columns} align="center" sx={{ py: 8 }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </TableCell>
  </TableRow>
);
