import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders default stack variant with loader and message', () => {
    render(<LoadingState />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders table variant with provided props', () => {
    render(
      <table>
        <tbody>
          <LoadingState variant="table" columns={5} message="Fetching data" />
        </tbody>
      </table>,
    );

    const cell = screen.getByRole('cell');
    expect(cell).toHaveAttribute('colspan', '5');
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });
});
