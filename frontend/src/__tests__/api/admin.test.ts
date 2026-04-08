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

import { adminApi } from '../../api/admin';

describe('adminApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listUsers should call get', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await adminApi.listUsers({ page: '1' });
    expect(mockGet).toHaveBeenCalledWith('/admin/users', { params: { page: '1' } });
  });

  it('getUserById should call get with id', async () => {
    mockGet.mockResolvedValue({ data: { user: {} } });
    await adminApi.getUserById('user-1');
    expect(mockGet).toHaveBeenCalledWith('/admin/users/user-1');
  });

  it('createUser should call post', async () => {
    mockPost.mockResolvedValue({ data: { user: {} } });
    await adminApi.createUser({ email: 'test@example.com', name: 'Test' });
    expect(mockPost).toHaveBeenCalledWith('/admin/users', { email: 'test@example.com', name: 'Test' });
  });

  it('updateUser should call put', async () => {
    mockPut.mockResolvedValue({ data: { user: {} } });
    await adminApi.updateUser('user-1', { name: 'Updated' });
    expect(mockPut).toHaveBeenCalledWith('/admin/users/user-1', { name: 'Updated' });
  });

  it('deactivateUser should call patch', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    await adminApi.deactivateUser('user-1');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-1/deactivate');
  });

  it('activateUser should call patch', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    await adminApi.activateUser('user-1');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/user-1/activate');
  });

  it('deleteUser should call delete with confirmEmail', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    await adminApi.deleteUser('user-1', 'test@example.com');
    expect(mockDelete).toHaveBeenCalledWith('/admin/users/user-1', { data: { confirmEmail: 'test@example.com' } });
  });
});
