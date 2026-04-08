const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { authApi } from '../../api/auth';

describe('authApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('signup should call post with correct params', async () => {
    mockPost.mockResolvedValue({ data: { user: {}, accessToken: 'at', refreshToken: 'rt' } });
    await authApi.signup({ email: 'test@example.com', password: 'Pass123!', name: 'Test' });
    expect(mockPost).toHaveBeenCalledWith('/auth/signup', { email: 'test@example.com', password: 'Pass123!', name: 'Test' });
  });

  it('login should call post with correct params', async () => {
    mockPost.mockResolvedValue({ data: { user: {}, accessToken: 'at', refreshToken: 'rt' } });
    await authApi.login({ email: 'test@example.com', password: 'Pass123!' });
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'Pass123!' });
  });

  it('logout should call post with refresh token', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await authApi.logout('refresh-token');
    expect(mockPost).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-token' });
  });

  it('refresh should call post with refresh token', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await authApi.refresh('refresh-token');
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-token' });
  });

  it('forgotPassword should call post with email', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await authApi.forgotPassword('test@example.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
  });

  it('resetPassword should call post with token and password', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await authApi.resetPassword('token', 'NewPass123!');
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', { token: 'token', newPassword: 'NewPass123!' });
  });
});
