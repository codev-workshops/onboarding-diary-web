import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

jest.mock('../../../api/issues', () => ({
  issuesApi: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
}));

import IssueFormPage from '../../../pages/issues/IssueFormPage';
import { issuesApi } from '../../../api/issues';

function renderIssueForm() {
  return render(
    <MemoryRouter>
      <IssueFormPage />
    </MemoryRouter>
  );
}

describe('IssueFormPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render new issue form', () => {
    renderIssueForm();
    expect(screen.getByText('New Issue')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should create issue on submit', async () => {
    (issuesApi.create as jest.Mock).mockResolvedValue({});
    renderIssueForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Issue' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Issue desc' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(issuesApi.create).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/issues');
    });
  });

  it('should show error on failure', async () => {
    (issuesApi.create as jest.Mock).mockRejectedValue(new Error('fail'));
    renderIssueForm();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save issue')).toBeInTheDocument();
    });
  });

  it('should navigate on cancel', () => {
    renderIssueForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/issues');
  });
});
