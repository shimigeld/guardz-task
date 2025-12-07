import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentProvider } from '@/contexts/IncidentContext';
import { useIncidentStreamPrefs } from '@/contexts/streamPrefsContext';
import { StreamControls } from '../StreamControls';

const StreamPrefsViewer = () => {
  const { isStreamPaused, muteLowWhileStreaming } = useIncidentStreamPrefs();
  return (
    <div>
      <div data-testid="paused">{String(isStreamPaused)}</div>
      <div data-testid="mute">{String(muteLowWhileStreaming)}</div>
    </div>
  );
};

const renderWithProvider = (ui: React.ReactNode) => render(<IncidentProvider>{ui}</IncidentProvider>);

describe('StreamControls', () => {
  it('toggles pause/resume and mute low-severity flag', async () => {
    const user = userEvent.setup();

    renderWithProvider(
      <>
        <StreamControls />
        <StreamPrefsViewer />
      </>,
    );

    const togglePause = screen.getByRole('button', { name: /pause stream/i });
    expect(screen.getByTestId('paused')).toHaveTextContent('false');

    await user.click(togglePause);
    expect(screen.getByTestId('paused')).toHaveTextContent('true');

    const toggleResume = screen.getByRole('button', { name: /resume stream/i });
    await user.click(toggleResume);
    expect(screen.getByTestId('paused')).toHaveTextContent('false');

    const muteSwitch = screen.getByRole('switch', { name: /mute low severity/i });
    expect(screen.getByTestId('mute')).toHaveTextContent('false');
    await user.click(muteSwitch);
    expect(screen.getByTestId('mute')).toHaveTextContent('true');
  });
});
