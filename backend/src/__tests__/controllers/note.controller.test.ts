import { Response, NextFunction } from 'express';
import { NoteController } from '../../controllers/note.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/note.service', () => ({
  noteService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listTags: jest.fn(),
  },
}));

import { noteService } from '../../services/note.service';

describe('NoteController', () => {
  let controller: NoteController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new NoteController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('list should return 200', async () => {
    (noteService.list as jest.Mock).mockResolvedValue({ data: [], total: 0 });
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('getById should return 200', async () => {
    mockReq.params = { id: 'note-1' };
    (noteService.getById as jest.Mock).mockResolvedValue({ id: 'note-1' });
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('create should return 201', async () => {
    (noteService.create as jest.Mock).mockResolvedValue({ id: 'note-1' });
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('update should return 200', async () => {
    mockReq.params = { id: 'note-1' };
    (noteService.update as jest.Mock).mockResolvedValue({ id: 'note-1' });
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('delete should return 200', async () => {
    mockReq.params = { id: 'note-1' };
    (noteService.delete as jest.Mock).mockResolvedValue(undefined);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('listTags should return 200', async () => {
    mockReq.query = { search: 'java' };
    (noteService.listTags as jest.Mock).mockResolvedValue([{ id: 'tag-1', name: 'javascript' }]);
    await controller.listTags(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should call next on errors', async () => {
    const error = new Error('fail');
    mockReq.params = { id: 'note-1' };

    (noteService.list as jest.Mock).mockRejectedValue(error);
    await controller.list(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);

    (noteService.getById as jest.Mock).mockRejectedValue(error);
    await controller.getById(mockReq as AuthRequest, mockRes as Response, mockNext);

    (noteService.create as jest.Mock).mockRejectedValue(error);
    await controller.create(mockReq as AuthRequest, mockRes as Response, mockNext);

    (noteService.update as jest.Mock).mockRejectedValue(error);
    await controller.update(mockReq as AuthRequest, mockRes as Response, mockNext);

    (noteService.delete as jest.Mock).mockRejectedValue(error);
    await controller.delete(mockReq as AuthRequest, mockRes as Response, mockNext);

    (noteService.listTags as jest.Mock).mockRejectedValue(error);
    await controller.listTags(mockReq as AuthRequest, mockRes as Response, mockNext);
  });
});
