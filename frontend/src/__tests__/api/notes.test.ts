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

import { notesApi } from '../../api/notes';

describe('notesApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list should call get', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await notesApi.list({ search: 'test' });
    expect(mockGet).toHaveBeenCalledWith('/notes', { params: { search: 'test' } });
  });

  it('getById should call get with id', async () => {
    mockGet.mockResolvedValue({ data: { note: {} } });
    await notesApi.getById('note-1');
    expect(mockGet).toHaveBeenCalledWith('/notes/note-1');
  });

  it('create should call post', async () => {
    mockPost.mockResolvedValue({ data: { note: {} } });
    await notesApi.create({ date: '2024-01-01', title: 'Test', content: 'Content' });
    expect(mockPost).toHaveBeenCalledWith('/notes', { date: '2024-01-01', title: 'Test', content: 'Content' });
  });

  it('update should call put', async () => {
    mockPut.mockResolvedValue({ data: { note: {} } });
    await notesApi.update('note-1', { title: 'Updated' });
    expect(mockPut).toHaveBeenCalledWith('/notes/note-1', { title: 'Updated' });
  });

  it('delete should call delete', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    await notesApi.delete('note-1');
    expect(mockDelete).toHaveBeenCalledWith('/notes/note-1');
  });

  it('listTags should call get', async () => {
    mockGet.mockResolvedValue({ data: { tags: [] } });
    await notesApi.listTags('java');
    expect(mockGet).toHaveBeenCalledWith('/tags', { params: { search: 'java' } });
  });
});
