import type { SxProps } from '@mui/material';

// Shared chip color mappings used across tables and drawers
export const SEVERITY_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  Critical: 'error',
  High: 'warning',
  Med: 'info',
  Low: 'default',
};

export const STATUS_COLORS: Record<
  string,
  'default' | 'primary' | 'success' | 'warning'
> = {
  Open: 'default',
  Investigating: 'primary',
  Resolved: 'success',
};

// Consistent chip sizing/alignment used in tables
export const UNIFORM_CHIP_SX: SxProps = {
  minWidth: 96,
  justifyContent: 'center',
};
