"use client";

import { Button, FormControlLabel, Stack, Switch } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useIncidentStreamPrefs } from "@/contexts/streamPrefsContext";

/**
 * Controls for the live stream: pause/resume toggle and optional mute-low toggle while streaming.
 * @returns Buttons/switch to pause/resume stream and mute low severity while streaming.
 */
export const StreamControls = () => {
	const { isStreamPaused, setIsStreamPaused, muteLowWhileStreaming, setMuteLowWhileStreaming } =
		useIncidentStreamPrefs();

	const toggleStream = () => {
		setIsStreamPaused((prev: boolean) => !prev);
	};

	const toggleMuteLow = () => {
		setMuteLowWhileStreaming((prev: boolean) => !prev);
	};

	return (
		<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
			<Button
				variant={isStreamPaused ? "outlined" : "contained"}
				color={isStreamPaused ? "inherit" : "primary"}
				startIcon={isStreamPaused ? <PlayArrowIcon /> : <PauseIcon />}
				onClick={toggleStream}
			>
				{isStreamPaused ? "Resume stream" : "Pause stream"}
			</Button>

			{!isStreamPaused && (
				<FormControlLabel
					control={<Switch checked={muteLowWhileStreaming} onChange={toggleMuteLow} />}
					label="Mute low severity while streaming" // Hidden when paused so it mirrors active stream state
				/>
			)}
		</Stack>
	);
};
