import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

jest.mock('../../../api/admin', () => ({
  adminApi: {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getUserById: jest.fn(),
  },
}));

import UserFormPage from '../../../pages/admin/UserFormPage';
import { adminApi } from '../../../api/admin';

function renderUserForm() {
  return render(
    <MemoryRouter>
      <UserFormPage />
    </MemoryRouter>
  );
}

describe('UserFormPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render create user form', () => {
    renderUserForm();
    expect(screen.getByText('Create User')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('should create user on submit', async () => {
    (adminApi.createUser as jest.Mock).mockResolvedValue({});
    renderUserForm();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@test.com' } });
    const passwordFields = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordFields[0], { target: { value: 'Pass123!' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New User' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(adminApi.createUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });
  });

  it('should show error on failure', async () => {
    (adminApi.createUser as jest.Mock).mockRejectedValue({ response: { data: { error: { message: 'Email exists' } } } });
    renderUserForm();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@test.com' } });
    const passwordFields = screen.getAllByLabelText(/password/i);
    fireEvent.change(passwordFields[0], { target: { value: 'Pass123!' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'User' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText('Email exists')).toBeInTheDocument();
    });
  });

  it('should navigate on cancel', () => {
    renderUserForm();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
  });
});
