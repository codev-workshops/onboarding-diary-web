import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/issues', () => ({
  issuesApi: {
    list: jest.fn(),
    delete: jest.fn(),
  },
}));

import IssueListPage from '../../../pages/issues/IssueListPage';
import { issuesApi } from '../../../api/issues';

const mockIssues = [
  { id: '1', date: '2024-01-01', title: 'Issue 1', severity: 'high', status: 'open', description: '', userId: 'u1', createdAt: '', updatedAt: '' },
  { id: '2', date: '2024-01-02', title: 'Issue 2', severity: 'low', status: 'resolved', description: '', userId: 'u1', createdAt: '', updatedAt: '' },
];

function renderIssueList() {
  return render(
    <MemoryRouter>
      <IssueListPage />
    </MemoryRouter>
  );
}

describe('IssueListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render issue list', async () => {
    (issuesApi.list as jest.Mock).mockResolvedValue({ data: { data: mockIssues, total: 2 } });
    renderIssueList();

    await waitFor(() => {
      expect(screen.getByText('Issue 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Issue 2')).toBeInTheDocument();
    expect(screen.getByText('Issue Log')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (issuesApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderIssueList();

    await waitFor(() => {
      expect(screen.getByText('No issues found')).toBeInTheDocument();
    });
  });

  it('should navigate to new issue', async () => {
    (issuesApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderIssueList();

    await waitFor(() => {
      expect(screen.getByText('New Issue')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New Issue'));
    expect(mockNavigate).toHaveBeenCalledWith('/issues/new');
  });

  it('should show error on fetch failure', async () => {
    (issuesApi.list as jest.Mock).mockRejectedValue(new Error('fail'));
    renderIssueList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load issues')).toBeInTheDocument();
    });
  });

  it('should handle delete', async () => {
    (issuesApi.list as jest.Mock).mockResolvedValue({ data: { data: mockIssues, total: 2 } });
    (issuesApi.delete as jest.Mock).mockResolvedValue({});
    renderIssueList();

    await waitFor(() => {
      expect(screen.getByText('Issue 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Are you sure you want to delete this issue?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(issuesApi.delete).toHaveBeenCalledWith('1');
    });
  });
});
