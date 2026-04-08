import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockForgotPassword = jest.fn();

jest.mock('../../../api/auth', () => ({
  authApi: {
    forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
  },
}));

import ForgotPasswordPage from '../../../pages/auth/ForgotPasswordPage';

function renderForgotPasswordPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render forgot password form', () => {
    renderForgotPasswordPage();
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('should show success message after sending reset link', async () => {
    mockForgotPassword.mockResolvedValue({});
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
    expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('should show error on failure', async () => {
    mockForgotPassword.mockRejectedValue(new Error('fail'));
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to send reset email/i)).toBeInTheDocument();
    });
  });

  it('should have back to login link', () => {
    renderForgotPasswordPage();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it('should show back to login on success page', async () => {
    mockForgotPassword.mockResolvedValue({});
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    });
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
  });
});
