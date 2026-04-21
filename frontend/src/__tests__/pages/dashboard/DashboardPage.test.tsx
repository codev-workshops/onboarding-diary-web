import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/dashboard', () => ({
  dashboardApi: {
    getSummary: jest.fn(),
    getRecentEntries: jest.fn(),
  },
}));

import DashboardPage from '../../../pages/dashboard/DashboardPage';
import { dashboardApi } from '../../../api/dashboard';

const mockSummary = {
  tasks: { total: 10, completed: 5, inProgress: 3, notStarted: 2 },
  issues: { total: 4, open: 2, resolved: 2 },
  feedback: { total: 6, positive: 3, suggestion: 2, concern: 1 },
  notes: { total: 8 },
  completionRate: 50,
  daysOnboarding: 14,
};

const mockRecentEntries = [
  { id: '1', title: 'Task 1', date: '2024-01-01', createdAt: '2024-01-01', category: 'task', status: 'completed' },
  { id: '2', title: 'Issue 1', date: '2024-01-02', createdAt: '2024-01-02', category: 'issue', severity: 'high' },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading spinner initially', () => {
    (dashboardApi.getSummary as jest.Mock).mockReturnValue(new Promise(() => {}));
    (dashboardApi.getRecentEntries as jest.Mock).mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render dashboard with summary data', async () => {
    (dashboardApi.getSummary as jest.Mock).mockResolvedValue({ data: { summary: mockSummary } });
    (dashboardApi.getRecentEntries as jest.Mock).mockResolvedValue({ data: { recentEntries: mockRecentEntries } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Task Completion')).toBeInTheDocument();
  });

  it('should render recent activity', async () => {
    (dashboardApi.getSummary as jest.Mock).mockResolvedValue({ data: { summary: mockSummary } });
    (dashboardApi.getRecentEntries as jest.Mock).mockResolvedValue({ data: { recentEntries: mockRecentEntries } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
  });

  it('should navigate when clicking recent entry', async () => {
    (dashboardApi.getSummary as jest.Mock).mockResolvedValue({ data: { summary: mockSummary } });
    (dashboardApi.getRecentEntries as jest.Mock).mockResolvedValue({ data: { recentEntries: mockRecentEntries } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Task 1'));
    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });

  it('should show error on fetch failure', async () => {
    (dashboardApi.getSummary as jest.Mock).mockRejectedValue(new Error('fail'));
    (dashboardApi.getRecentEntries as jest.Mock).mockRejectedValue(new Error('fail'));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('should show no recent activity message when empty', async () => {
    (dashboardApi.getSummary as jest.Mock).mockResolvedValue({ data: { summary: mockSummary } });
    (dashboardApi.getRecentEntries as jest.Mock).mockResolvedValue({ data: { recentEntries: [] } });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });
});
