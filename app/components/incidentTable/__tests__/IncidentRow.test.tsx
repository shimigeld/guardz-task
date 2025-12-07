import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentRow } from '../IncidentRow';
import type { Incident } from '@/types/incident';

const incident: Incident = {
  id: 'i1',
  severity: 'Critical',
  title: 'Critical alert',
  account: 'Acme',
  source: 'EDR',
  timestamp: '2024-02-01T00:00:00Z',
  status: 'Investigating',
  tags: ['tag1', 'tag2'],
  createdAt: '2024-02-01T00:00:00Z',
  updatedAt: '2024-02-01T00:00:00Z',
};

describe('IncidentRow', () => {
  it('renders incident fields and tags', () => {
    render(
      <table>
        <tbody>
          <IncidentRow
            incident={incident}
            selected={false}
            onSelect={vi.fn()}
            onOpen={vi.fn()}
            isNew
          />
        </tbody>
      </table>,
    );

    expect(screen.getByText('Critical alert')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Investigating')).toBeInTheDocument();
    expect(screen.getAllByText(/tag/)).toHaveLength(2);
  });

  it('handles selection and row click', async () => {
    const onSelect = vi.fn();
    const onOpen = vi.fn();
    const user = userEvent.setup();

    render(
      <table>
        <tbody>
          <IncidentRow
            incident={incident}
            selected={false}
            onSelect={onSelect}
            onOpen={onOpen}
            isNew={false}
          />
        </tbody>
      </table>,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(onSelect).toHaveBeenCalledWith('i1', true);

    await user.click(screen.getByText('Critical alert'));
    expect(onOpen).toHaveBeenCalledWith('i1');
  });
});
