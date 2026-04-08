import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/admin', () => ({
  adminApi: {
    listUsers: jest.fn(),
    deleteUser: jest.fn(),
    deactivateUser: jest.fn(),
    activateUser: jest.fn(),
  },
}));

import UserListPage from '../../../pages/admin/UserListPage';
import { adminApi } from '../../../api/admin';

const mockUsers = [
  { id: '1', name: 'User 1', email: 'user1@test.com', role: 'recruit', department: 'Eng', isActive: true, createdAt: '' },
  { id: '2', name: 'User 2', email: 'user2@test.com', role: 'manager', department: '', isActive: false, createdAt: '' },
];

function renderUserList() {
  return render(
    <MemoryRouter>
      <UserListPage />
    </MemoryRouter>
  );
}

describe('UserListPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render user list', async () => {
    (adminApi.listUsers as jest.Mock).mockResolvedValue({ data: { data: mockUsers, total: 2 } });
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
    expect(screen.getByText('User 2')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('should show empty state', async () => {
    (adminApi.listUsers as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should navigate to new user', async () => {
    (adminApi.listUsers as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('New User'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/new');
  });

  it('should show error on failure', async () => {
    (adminApi.listUsers as jest.Mock).mockRejectedValue(new Error('fail'));
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });
  });

  it('should handle delete', async () => {
    (adminApi.listUsers as jest.Mock).mockResolvedValue({ data: { data: mockUsers, total: 2 } });
    (adminApi.deleteUser as jest.Mock).mockResolvedValue({});
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(adminApi.deleteUser).toHaveBeenCalledWith('1', 'user1@test.com');
    });
  });

  it('should toggle user active status', async () => {
    (adminApi.listUsers as jest.Mock).mockResolvedValue({ data: { data: mockUsers, total: 2 } });
    (adminApi.deactivateUser as jest.Mock).mockResolvedValue({});
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    const blockIcons = screen.getAllByTestId('BlockIcon');
    fireEvent.click(blockIcons[0]);

    await waitFor(() => {
      expect(adminApi.deactivateUser).toHaveBeenCalledWith('1');
    });
  });
});
