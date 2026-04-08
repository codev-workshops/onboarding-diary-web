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

import { issuesApi } from '../../api/issues';

describe('issuesApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list should call get', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await issuesApi.list({ status: 'open' });
    expect(mockGet).toHaveBeenCalledWith('/issues', { params: { status: 'open' } });
  });

  it('getById should call get with id', async () => {
    mockGet.mockResolvedValue({ data: { issue: {} } });
    await issuesApi.getById('issue-1');
    expect(mockGet).toHaveBeenCalledWith('/issues/issue-1');
  });

  it('create should call post', async () => {
    mockPost.mockResolvedValue({ data: { issue: {} } });
    await issuesApi.create({ title: 'Bug', severity: 'high' });
    expect(mockPost).toHaveBeenCalledWith('/issues', { title: 'Bug', severity: 'high' });
  });

  it('update should call put', async () => {
    mockPut.mockResolvedValue({ data: { issue: {} } });
    await issuesApi.update('issue-1', { title: 'Updated Bug' });
    expect(mockPut).toHaveBeenCalledWith('/issues/issue-1', { title: 'Updated Bug' });
  });

  it('resolve should call patch', async () => {
    mockPatch.mockResolvedValue({ data: { issue: {} } });
    await issuesApi.resolve('issue-1', 'Fixed it');
    expect(mockPatch).toHaveBeenCalledWith('/issues/issue-1/resolve', { resolutionNotes: 'Fixed it' });
  });

  it('delete should call delete', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    await issuesApi.delete('issue-1');
    expect(mockDelete).toHaveBeenCalledWith('/issues/issue-1');
  });
});
