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

import { feedbackApi } from '../../api/feedback';

describe('feedbackApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list should call get', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await feedbackApi.list({ type: 'positive' });
    expect(mockGet).toHaveBeenCalledWith('/feedback', { params: { type: 'positive' } });
  });

  it('getById should call get with id', async () => {
    mockGet.mockResolvedValue({ data: { feedback: {} } });
    await feedbackApi.getById('fb-1');
    expect(mockGet).toHaveBeenCalledWith('/feedback/fb-1');
  });

  it('create should call post', async () => {
    mockPost.mockResolvedValue({ data: { feedback: {} } });
    await feedbackApi.create({ subject: 'Great', type: 'positive' });
    expect(mockPost).toHaveBeenCalledWith('/feedback', { subject: 'Great', type: 'positive' });
  });

  it('update should call put', async () => {
    mockPut.mockResolvedValue({ data: { feedback: {} } });
    await feedbackApi.update('fb-1', { subject: 'Updated' });
    expect(mockPut).toHaveBeenCalledWith('/feedback/fb-1', { subject: 'Updated' });
  });

  it('delete should call delete', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    await feedbackApi.delete('fb-1');
    expect(mockDelete).toHaveBeenCalledWith('/feedback/fb-1');
  });
});
