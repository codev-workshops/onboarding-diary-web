import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSignup = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ signup: mockSignup }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import SignupPage from '../../../pages/auth/SignupPage';

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );
}

describe('SignupPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render signup form', () => {
    renderSignupPage();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    const passwordFields = screen.getAllByLabelText(/password/i);
    expect(passwordFields.length).toBeGreaterThanOrEqual(2);
  });

  it('should show error when passwords do not match', async () => {
    renderSignupPage();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(passwordFields[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordFields[1], { target: { value: 'Different123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should call signup on valid form submit', async () => {
    mockSignup.mockResolvedValue(undefined);
    renderSignupPage();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(passwordFields[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordFields[1], { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'Password123!', 'Test User');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should show error on signup failure', async () => {
    mockSignup.mockRejectedValue({ response: { data: { error: { message: 'Email already exists' } } } });
    renderSignupPage();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(passwordFields[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordFields[1], { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('should show generic error when no error message', async () => {
    mockSignup.mockRejectedValue(new Error('fail'));
    renderSignupPage();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(passwordFields[0], { target: { value: 'pass' } });
    fireEvent.change(passwordFields[1], { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Signup failed')).toBeInTheDocument();
    });
  });

  it('should have link to login page', () => {
    renderSignupPage();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });
});
