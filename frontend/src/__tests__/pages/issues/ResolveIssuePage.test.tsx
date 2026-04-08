import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'issue-1' }),
}));

jest.mock('../../../api/issues', () => ({
  issuesApi: {
    resolve: jest.fn(),
  },
}));

import ResolveIssuePage from '../../../pages/issues/ResolveIssuePage';
import { issuesApi } from '../../../api/issues';

function renderResolve() {
  return render(
    <MemoryRouter>
      <ResolveIssuePage />
    </MemoryRouter>
  );
}

describe('ResolveIssuePage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render resolve form', () => {
    renderResolve();
    expect(screen.getByText('Resolve Issue')).toBeInTheDocument();
    expect(screen.getByLabelText(/resolution notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark as resolved/i })).toBeInTheDocument();
  });

  it('should resolve issue on submit', async () => {
    (issuesApi.resolve as jest.Mock).mockResolvedValue({});
    renderResolve();

    fireEvent.change(screen.getByLabelText(/resolution notes/i), { target: { value: 'Fixed the bug' } });
    fireEvent.click(screen.getByRole('button', { name: /mark as resolved/i }));

    await waitFor(() => {
      expect(issuesApi.resolve).toHaveBeenCalledWith('issue-1', 'Fixed the bug');
      expect(mockNavigate).toHaveBeenCalledWith('/issues');
    });
  });

  it('should show error on failure', async () => {
    (issuesApi.resolve as jest.Mock).mockRejectedValue(new Error('fail'));
    renderResolve();

    fireEvent.change(screen.getByLabelText(/resolution notes/i), { target: { value: 'Fix' } });
    fireEvent.click(screen.getByRole('button', { name: /mark as resolved/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to resolve issue')).toBeInTheDocument();
    });
  });

  it('should navigate on cancel', () => {
    renderResolve();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/issues');
  });
});
