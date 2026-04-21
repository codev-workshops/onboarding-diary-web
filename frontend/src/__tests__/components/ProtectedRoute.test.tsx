import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedRoute from '../../components/common/ProtectedRoute';

function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show loading spinner when isLoading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null });
    renderWithRouter(<ProtectedRoute><div>Content</div></ProtectedRoute>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
    const { container } = renderWithRouter(<ProtectedRoute><div>Content</div></ProtectedRoute>);
    expect(container.textContent).not.toContain('Content');
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'recruit' } });
    renderWithRouter(<ProtectedRoute><div>Content</div></ProtectedRoute>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should redirect when user role not in allowed roles', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'recruit' } });
    const { container } = renderWithRouter(
      <ProtectedRoute roles={['admin']}><div>Admin Only</div></ProtectedRoute>
    );
    expect(container.textContent).not.toContain('Admin Only');
  });

  it('should render when user role is in allowed roles', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'admin' } });
    renderWithRouter(
      <ProtectedRoute roles={['admin']}><div>Admin Only</div></ProtectedRoute>
    );
    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  it('should render when no roles specified for authenticated user', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: { role: 'recruit' } });
    renderWithRouter(<ProtectedRoute><div>Any User</div></ProtectedRoute>);
    expect(screen.getByText('Any User')).toBeInTheDocument();
  });
});
