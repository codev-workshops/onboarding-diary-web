const mockGet = jest.fn();
const mockPatch = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    patch: mockPatch,
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { profileApi } from '../../api/profile';

describe('profileApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getProfile should call get', async () => {
    mockGet.mockResolvedValue({ data: { user: {} } });
    await profileApi.getProfile();
    expect(mockGet).toHaveBeenCalledWith('/profile');
  });

  it('updateProfile should call patch with data', async () => {
    mockPatch.mockResolvedValue({ data: { user: {} } });
    await profileApi.updateProfile({ name: 'Updated', department: 'Engineering' });
    expect(mockPatch).toHaveBeenCalledWith('/profile', { name: 'Updated', department: 'Engineering' });
  });

  it('changePassword should call patch with passwords', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    await profileApi.changePassword({ currentPassword: 'old', newPassword: 'new' });
    expect(mockPatch).toHaveBeenCalledWith('/profile/password', { currentPassword: 'old', newPassword: 'new' });
  });
});
