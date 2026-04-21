import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'recruit', createdAt: '' };

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, logout: mockLogout }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

import MainLayout from '../../components/layout/MainLayout';

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <MainLayout />
    </MemoryRouter>
  );
}

describe('MainLayout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render app bar with title', () => {
    renderLayout();
    const titles = screen.getAllByText('Onboarding Diary');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('should render navigation items for recruit', () => {
    renderLayout();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Task Log')).toBeInTheDocument();
    expect(screen.getByText('Issue Log')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should not show admin items for recruit', () => {
    renderLayout();
    expect(screen.queryByText('User Management')).not.toBeInTheDocument();
  });

  it('should render outlet', () => {
    renderLayout();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should navigate when nav item clicked', () => {
    renderLayout();
    fireEvent.click(screen.getByText('Task Log'));
    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });

  it('should show user avatar', () => {
    renderLayout();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('should open user menu on avatar click', () => {
    renderLayout();
    fireEvent.click(screen.getByText('T'));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should navigate to profile', () => {
    renderLayout();
    fireEvent.click(screen.getByText('T'));
    fireEvent.click(screen.getByText('Profile'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should call logout and navigate', async () => {
    renderLayout();
    fireEvent.click(screen.getByText('T'));
    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
