import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'recruit-1' }),
}));

jest.mock('../../../api/manager', () => ({
  managerApi: {
    getRecruitTasks: jest.fn(),
    getRecruitIssues: jest.fn(),
    getRecruitFeedback: jest.fn(),
    getRecruitNotes: jest.fn(),
  },
}));

import RecruitDetailPage from '../../../pages/manager/RecruitDetailPage';
import { managerApi } from '../../../api/manager';

const mockTasks = [{ id: '1', date: '2024-01-01', title: 'Task 1', category: 'coding', status: 'completed', priority: 'high' }];
const mockIssues = [{ id: '1', date: '2024-01-01', title: 'Issue 1', severity: 'high', status: 'open' }];
const mockFeedback = [{ id: '1', date: '2024-01-01', subject: 'FB 1', type: 'positive' }];
const mockNotes = [{ id: '1', date: '2024-01-01', title: 'Note 1', tags: ['tag1'] }];

function renderRecruitDetail() {
  return render(
    <MemoryRouter>
      <RecruitDetailPage />
    </MemoryRouter>
  );
}

describe('RecruitDetailPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading then render tabs', async () => {
    (managerApi.getRecruitTasks as jest.Mock).mockResolvedValue({ data: { data: mockTasks } });
    (managerApi.getRecruitIssues as jest.Mock).mockResolvedValue({ data: { data: mockIssues } });
    (managerApi.getRecruitFeedback as jest.Mock).mockResolvedValue({ data: { data: mockFeedback } });
    (managerApi.getRecruitNotes as jest.Mock).mockResolvedValue({ data: { data: mockNotes } });
    renderRecruitDetail();

    await waitFor(() => {
      expect(screen.getByText('Recruit Details')).toBeInTheDocument();
    });
    expect(screen.getByText('Tasks (1)')).toBeInTheDocument();
    expect(screen.getByText('Issues (1)')).toBeInTheDocument();
    expect(screen.getByText('Feedback (1)')).toBeInTheDocument();
    expect(screen.getByText('Notes (1)')).toBeInTheDocument();
  });

  it('should show tasks tab by default', async () => {
    (managerApi.getRecruitTasks as jest.Mock).mockResolvedValue({ data: { data: mockTasks } });
    (managerApi.getRecruitIssues as jest.Mock).mockResolvedValue({ data: { data: mockIssues } });
    (managerApi.getRecruitFeedback as jest.Mock).mockResolvedValue({ data: { data: mockFeedback } });
    (managerApi.getRecruitNotes as jest.Mock).mockResolvedValue({ data: { data: mockNotes } });
    renderRecruitDetail();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });
  });

  it('should switch to issues tab', async () => {
    (managerApi.getRecruitTasks as jest.Mock).mockResolvedValue({ data: { data: mockTasks } });
    (managerApi.getRecruitIssues as jest.Mock).mockResolvedValue({ data: { data: mockIssues } });
    (managerApi.getRecruitFeedback as jest.Mock).mockResolvedValue({ data: { data: mockFeedback } });
    (managerApi.getRecruitNotes as jest.Mock).mockResolvedValue({ data: { data: mockNotes } });
    renderRecruitDetail();

    await waitFor(() => {
      expect(screen.getByText('Issues (1)')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Issues (1)'));
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
  });

  it('should show error on failure', async () => {
    (managerApi.getRecruitTasks as jest.Mock).mockRejectedValue(new Error('fail'));
    (managerApi.getRecruitIssues as jest.Mock).mockRejectedValue(new Error('fail'));
    (managerApi.getRecruitFeedback as jest.Mock).mockRejectedValue(new Error('fail'));
    (managerApi.getRecruitNotes as jest.Mock).mockRejectedValue(new Error('fail'));
    renderRecruitDetail();

    await waitFor(() => {
      expect(screen.getByText('Failed to load recruit data')).toBeInTheDocument();
    });
  });
});
