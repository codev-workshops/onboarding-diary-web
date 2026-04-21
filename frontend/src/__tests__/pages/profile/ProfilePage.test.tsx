import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUpdateUser = jest.fn();
const mockUser = {
  id: '1', email: 'test@test.com', name: 'Test User', role: 'recruit',
  department: 'Engineering', startDate: '2024-01-01', createdAt: '',
};

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, updateUser: mockUpdateUser }),
}));

jest.mock('../../../api/profile', () => ({
  profileApi: {
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
}));

import ProfilePage from '../../../pages/profile/ProfilePage';
import { profileApi } from '../../../api/profile';

function renderProfile() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render profile page', () => {
    renderProfile();
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getAllByText(/change password/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should show user info', () => {
    renderProfile();
    expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('recruit')).toBeInTheDocument();
  });

  it('should update profile', async () => {
    (profileApi.updateProfile as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
    renderProfile();

    fireEvent.change(screen.getByDisplayValue('Test User'), { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(profileApi.updateProfile).toHaveBeenCalled();
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('should show error on profile update failure', async () => {
    (profileApi.updateProfile as jest.Mock).mockRejectedValue(new Error('fail'));
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });

  it('should show password mismatch error', async () => {
    renderProfile();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(passwordFields[0], { target: { value: 'oldpass' } });
    fireEvent.change(passwordFields[1], { target: { value: 'NewPass123!' } });
    fireEvent.change(passwordFields[2], { target: { value: 'Different123!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should change password successfully', async () => {
    (profileApi.changePassword as jest.Mock).mockResolvedValue({});
    renderProfile();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(passwordFields[0], { target: { value: 'oldpass' } });
    fireEvent.change(passwordFields[1], { target: { value: 'NewPass123!' } });
    fireEvent.change(passwordFields[2], { target: { value: 'NewPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(profileApi.changePassword).toHaveBeenCalled();
      expect(screen.getByText('Password changed successfully')).toBeInTheDocument();
    });
  });

  it('should show error on password change failure', async () => {
    (profileApi.changePassword as jest.Mock).mockRejectedValue(new Error('fail'));
    renderProfile();
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.change(passwordFields[0], { target: { value: 'oldpass' } });
    fireEvent.change(passwordFields[1], { target: { value: 'NewPass123!' } });
    fireEvent.change(passwordFields[2], { target: { value: 'NewPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to change password')).toBeInTheDocument();
    });
  });
});
