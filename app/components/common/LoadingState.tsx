'use client';

import { Box, CircularProgress, TableCell, TableRow, Typography } from '@mui/material';

type LoadingVariant = 'stack' | 'table';

interface LoadingStateProps {
	message?: string;
	minHeight?: number;
	variant?: LoadingVariant;
	columns?: number;
	size?: number;
}

/**
 * Reusable loading placeholder used both in stacks and inside tables.
 * When `variant` is `table`, it spans the provided number of columns.
 * @param message Optional text shown under the spinner.
 * @param minHeight Minimum height to reserve for the placeholder container.
 * @param variant Layout variant: stacked box or table row.
 * @param columns Number of columns to span when `variant` is `table`.
 * @param size Diameter of the CircularProgress indicator.
 */
export const LoadingState = ({
	message = 'Loading...',
	minHeight = 160,
	variant = 'stack',
	columns = 8,
	size = 28,
}: LoadingStateProps) => {
	const content = (
		<Box
			sx={{
				width: '100%',
				minHeight,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1,
			}}
		>
			<CircularProgress size={size} />
			{message && (
				<Typography variant="body2" color="text.secondary">
					{message}
				</Typography>
			)}
		</Box>
	);

	if (variant === 'table') {
		return (
			<TableRow>
				<TableCell colSpan={columns}>{content}</TableCell>
			</TableRow>
		);
	}

	return content;
};
