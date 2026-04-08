import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/feedback', () => ({
  feedbackApi: {
    list: jest.fn(),
    delete: jest.fn(),
  },
}));

import FeedbackListPage from '../../../pages/feedback/FeedbackListPage';
import { feedbackApi } from '../../../api/feedback';

const mockFeedback = [
  { id: '1', date: '2024-01-01', subject: 'Feedback 1', type: 'positive', details: 'Good', userId: 'u1', createdAt: '', updatedAt: '' },
  { id: '2', date: '2024-01-02', subject: 'Feedback 2', type: 'concern', details: 'Issue', userId: 'u1', createdAt: '', updatedAt: '' },
];

function renderFeedbackList() {
  return render(
    <MemoryRouter>
      <FeedbackListPage />
    </MemoryRouter>
  );
}

describe('FeedbackListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render feedback list', async () => {
    (feedbackApi.list as jest.Mock).mockResolvedValue({ data: { data: mockFeedback, total: 2 } });
    renderFeedbackList();

    await waitFor(() => {
      expect(screen.getByText('Feedback 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Feedback 2')).toBeInTheDocument();
    expect(screen.getByText('Feedback Notes')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (feedbackApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderFeedbackList();

    await waitFor(() => {
      expect(screen.getByText('No feedback found')).toBeInTheDocument();
    });
  });

  it('should navigate to new feedback', async () => {
    (feedbackApi.list as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderFeedbackList();

    await waitFor(() => {
      expect(screen.getByText('New Feedback')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New Feedback'));
    expect(mockNavigate).toHaveBeenCalledWith('/feedback/new');
  });

  it('should show error on failure', async () => {
    (feedbackApi.list as jest.Mock).mockRejectedValue(new Error('fail'));
    renderFeedbackList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load feedback')).toBeInTheDocument();
    });
  });

  it('should handle delete', async () => {
    (feedbackApi.list as jest.Mock).mockResolvedValue({ data: { data: mockFeedback, total: 2 } });
    (feedbackApi.delete as jest.Mock).mockResolvedValue({});
    renderFeedbackList();

    await waitFor(() => {
      expect(screen.getByText('Feedback 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(feedbackApi.delete).toHaveBeenCalledWith('1');
    });
  });
});
