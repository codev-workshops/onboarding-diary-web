import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

const mockLogin = jest.fn();
const mockSignup = jest.fn();
const mockLogout = jest.fn();
const mockGetProfile = jest.fn();

jest.mock('../../api/auth', () => ({
  authApi: {
    login: (...args: unknown[]) => mockLogin(...args),
    signup: (...args: unknown[]) => mockSignup(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
  },
}));

jest.mock('../../api/profile', () => ({
  profileApi: {
    getProfile: () => mockGetProfile(),
  },
}));

function TestComponent() {
  const { user, isAuthenticated, isLoading, login, signup, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : 'null'}</span>
      <button onClick={() => login('test@example.com', 'pass')}>Login</button>
      <button onClick={() => signup('test@example.com', 'pass', 'Test')}>Signup</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => updateUser({ id: 'u1', email: 'test@example.com', name: 'Updated', role: 'recruit', createdAt: '' })}>Update</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should start with loading true when token exists', async () => {
    localStorage.setItem('accessToken', 'token');
    mockGetProfile.mockResolvedValue({ data: { user: { id: 'u1', name: 'Test', email: 'test@example.com', role: 'recruit', createdAt: '' } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('Test');
  });

  it('should set loading false when no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('should handle login', async () => {
    mockLogin.mockResolvedValue({
      data: { user: { id: 'u1', name: 'Test', email: 'test@example.com', role: 'recruit', createdAt: '' }, accessToken: 'at', refreshToken: 'rt' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(localStorage.getItem('accessToken')).toBe('at');
    expect(localStorage.getItem('refreshToken')).toBe('rt');
  });

  it('should handle signup', async () => {
    mockSignup.mockResolvedValue({
      data: { user: { id: 'u1', name: 'Test', email: 'test@example.com', role: 'recruit', createdAt: '' }, accessToken: 'at', refreshToken: 'rt' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      screen.getByText('Signup').click();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('should handle logout', async () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'rt');
    mockGetProfile.mockResolvedValue({ data: { user: { id: 'u1', name: 'Test', email: 'test@example.com', role: 'recruit', createdAt: '' } } });
    mockLogout.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should handle updateUser', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      screen.getByText('Update').click();
    });

    expect(screen.getByTestId('user').textContent).toBe('Updated');
  });

  it('should clear tokens on profile load failure', async () => {
    localStorage.setItem('accessToken', 'bad-token');
    localStorage.setItem('refreshToken', 'rt');
    mockGetProfile.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('useAuth should throw when used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    consoleSpy.mockRestore();
  });

  it('should handle logout error gracefully', async () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('refreshToken', 'rt');
    mockGetProfile.mockResolvedValue({ data: { user: { id: 'u1', name: 'Test', email: 'test@example.com', role: 'recruit', createdAt: '' } } });
    mockLogout.mockRejectedValue(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
