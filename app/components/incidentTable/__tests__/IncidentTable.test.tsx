import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentTable } from '../IncidentTable';

type StreamStatus = 'success' | 'connecting';

const incidents = [
  {
    id: '1',
    severity: 'Critical' as const,
    title: 'Critical event',
    account: 'Acme',
    source: 'EDR',
    timestamp: '2024-01-01T00:00:00Z',
    status: 'Open' as const,
    tags: ['tag1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    severity: 'Low' as const,
    title: 'Low event',
    account: 'Beta',
    source: 'SIEM',
    timestamp: '2024-01-02T00:00:00Z',
    status: 'Resolved' as const,
    tags: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const handleSort = vi.fn();
const handleSelectAll = vi.fn();
const handleSelectRow = vi.fn();
const handleRowClick = vi.fn();
const setShowToast = vi.fn<(value: boolean) => void>();
const clearNewIncidentHighlights = vi.fn<() => void>();

type MockReturn = {
  incidents: typeof incidents;
  isLoading: boolean;
  error: null;
  filters: { sortBy: 'timestamp'; sortOrder: 'DESC' | 'ASC' };
  selectedIds: Set<string>;
  newIncidentIds: Set<string>;
  showToast: boolean;
  setShowToast: typeof setShowToast;
  clearNewIncidentHighlights: typeof clearNewIncidentHighlights;
  handleSort: typeof handleSort;
  handleSelectAll: typeof handleSelectAll;
  handleSelectRow: typeof handleSelectRow;
  handleRowClick: typeof handleRowClick;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  streamStatus: StreamStatus;
  lastStreamAt: number | null;
  streamAppliedCount: number;
  streamDroppedCount: number;
};

let mockReturn: MockReturn;

const buildMockReturn = (): MockReturn => ({
  incidents,
  isLoading: false,
  error: null,
  filters: { sortBy: 'timestamp', sortOrder: 'DESC' as const },
  selectedIds: new Set<string>(),
  newIncidentIds: new Set<string>(),
  showToast: false,
  setShowToast,
  clearNewIncidentHighlights,
  handleSort,
  handleSelectAll,
  handleSelectRow,
  handleRowClick,
  isAllSelected: false,
  isSomeSelected: false,
  streamStatus: 'success',
  lastStreamAt: null,
  streamAppliedCount: 0,
  streamDroppedCount: 0,
});

vi.mock('../useIncidentTableData', () => ({
  useIncidentTableData: () => mockReturn,
}));

describe('IncidentTable', () => {
  beforeEach(() => {
    handleSort.mockClear();
    handleSelectAll.mockClear();
    handleSelectRow.mockClear();
    handleRowClick.mockClear();
    setShowToast.mockClear();
    clearNewIncidentHighlights.mockClear();
    mockReturn = buildMockReturn();
  });

  it('renders rows and forwards sort/select events', async () => {
    const user = userEvent.setup();

    mockReturn = buildMockReturn();
    render(<IncidentTable />);

    expect(screen.getByText('Critical event')).toBeInTheDocument();
    expect(screen.getByText('Low event')).toBeInTheDocument();

    const severitySort = screen.getByRole('button', { name: /severity/i });
    await user.click(severitySort);
    expect(handleSort).toHaveBeenCalledWith('severity');

    const [selectAll, firstRowCheckbox] = screen.getAllByRole('checkbox');
    await user.click(selectAll);
    expect(handleSelectAll).toHaveBeenCalledWith(true);

    await user.click(firstRowCheckbox);
    expect(handleSelectRow).toHaveBeenCalledWith('1', true);

    await user.click(screen.getByText('Critical event'));
    expect(handleRowClick).toHaveBeenCalledWith('1');

    expect(setShowToast).not.toHaveBeenCalled();
    expect(clearNewIncidentHighlights).not.toHaveBeenCalled();
  });

  it('shows new incident toast and stream status', async () => {
    mockReturn = {
      ...buildMockReturn(),
      newIncidentIds: new Set<string>(['x', 'y']),
      showToast: true,
      streamStatus: 'connecting',
    };

    render(<IncidentTable />);

    expect(await screen.findByText('2 new incidents')).toBeInTheDocument();
    expect(screen.getByText(/Streaming status: connecting/i)).toBeInTheDocument();
  });
});
