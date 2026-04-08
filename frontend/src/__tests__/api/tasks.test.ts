const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { tasksApi } from '../../api/tasks';

describe('tasksApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list should call get with params', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await tasksApi.list({ page: '1', limit: '10' });
    expect(mockGet).toHaveBeenCalledWith('/tasks', { params: { page: '1', limit: '10' } });
  });

  it('getById should call get with id', async () => {
    mockGet.mockResolvedValue({ data: { task: {} } });
    await tasksApi.getById('task-1');
    expect(mockGet).toHaveBeenCalledWith('/tasks/task-1');
  });

  it('create should call post with data', async () => {
    mockPost.mockResolvedValue({ data: { task: {} } });
    await tasksApi.create({ title: 'New Task', category: 'coding' });
    expect(mockPost).toHaveBeenCalledWith('/tasks', { title: 'New Task', category: 'coding' });
  });

  it('update should call put with id and data', async () => {
    mockPut.mockResolvedValue({ data: { task: {} } });
    await tasksApi.update('task-1', { title: 'Updated' });
    expect(mockPut).toHaveBeenCalledWith('/tasks/task-1', { title: 'Updated' });
  });

  it('delete should call delete with id', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    await tasksApi.delete('task-1');
    expect(mockDelete).toHaveBeenCalledWith('/tasks/task-1');
  });
});
