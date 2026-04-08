const mockGet = jest.fn();

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

import { managerApi } from '../../api/manager';

describe('managerApi', () => {
  beforeEach(() => jest.clearAllMocks());

  it('listRecruits should call get', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await managerApi.listRecruits({ page: '1' });
    expect(mockGet).toHaveBeenCalledWith('/manager/recruits', { params: { page: '1' } });
  });

  it('getRecruitTasks should call get with recruitId', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await managerApi.getRecruitTasks('recruit-1', { page: '1' });
    expect(mockGet).toHaveBeenCalledWith('/manager/recruits/recruit-1/tasks', { params: { page: '1' } });
  });

  it('getRecruitIssues should call get with recruitId', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await managerApi.getRecruitIssues('recruit-1', { status: 'open' });
    expect(mockGet).toHaveBeenCalledWith('/manager/recruits/recruit-1/issues', { params: { status: 'open' } });
  });

  it('getRecruitFeedback should call get with recruitId', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await managerApi.getRecruitFeedback('recruit-1');
    expect(mockGet).toHaveBeenCalledWith('/manager/recruits/recruit-1/feedback', { params: undefined });
  });

  it('getRecruitNotes should call get with recruitId', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } });
    await managerApi.getRecruitNotes('recruit-1');
    expect(mockGet).toHaveBeenCalledWith('/manager/recruits/recruit-1/notes', { params: undefined });
  });
});
