import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

jest.mock('../../../api/feedback', () => ({
  feedbackApi: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
}));

import FeedbackFormPage from '../../../pages/feedback/FeedbackFormPage';
import { feedbackApi } from '../../../api/feedback';

function renderFeedbackForm() {
  return render(
    <MemoryRouter>
      <FeedbackFormPage />
    </MemoryRouter>
  );
}

describe('FeedbackFormPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render new feedback form', () => {
    renderFeedbackForm();
    expect(screen.getByText('New Feedback')).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/details/i)).toBeInTheDocument();
  });

  it('should create feedback on submit', async () => {
    (feedbackApi.create as jest.Mock).mockResolvedValue({});
    renderFeedbackForm();

    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Good experience' } });
    fireEvent.change(screen.getByLabelText(/details/i), { target: { value: 'Very helpful onboarding' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(feedbackApi.create).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/feedback');
    });
  });

  it('should show error on failure', async () => {
    (feedbackApi.create as jest.Mock).mockRejectedValue(new Error('fail'));
    renderFeedbackForm();

    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/details/i), { target: { value: 'Details here' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save feedback')).toBeInTheDocument();
    });
  });

  it('should navigate on cancel', () => {
    renderFeedbackForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/feedback');
  });
});
