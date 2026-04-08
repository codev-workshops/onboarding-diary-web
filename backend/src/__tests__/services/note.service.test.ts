import { NoteService } from '../../services/note.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    additionalNote: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    tag: { findMany: jest.fn(), upsert: jest.fn() },
    noteTag: { create: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('NoteService', () => {
  let noteService: NoteService;

  beforeEach(() => {
    noteService = new NoteService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated notes', async () => {
      prisma.additionalNote.findMany.mockResolvedValue([
        { id: 'note-1', title: 'Note 1', tags: [{ tag: { name: 'tag1' } }] },
      ]);
      prisma.additionalNote.count.mockResolvedValue(1);

      const result = await noteService.list('user-1', {});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply search filter', async () => {
      prisma.additionalNote.findMany.mockResolvedValue([]);
      prisma.additionalNote.count.mockResolvedValue(0);

      await noteService.list('user-1', { search: 'test' });
      const callArgs = prisma.additionalNote.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });

    it('should apply tag filter', async () => {
      prisma.additionalNote.findMany.mockResolvedValue([]);
      prisma.additionalNote.count.mockResolvedValue(0);

      await noteService.list('user-1', { tags: 'javascript,react' });
      const callArgs = prisma.additionalNote.findMany.mock.calls[0][0];
      expect(callArgs.where.tags).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should return a note if found', async () => {
      prisma.additionalNote.findFirst.mockResolvedValue({
        id: 'note-1', title: 'Note 1', tags: [{ tag: { name: 'tag1' } }],
      });
      const result = await noteService.getById('note-1', 'user-1');
      expect(result).toBeDefined();
      expect(result.tags).toEqual(['tag1']);
    });

    it('should throw 404 if note not found', async () => {
      prisma.additionalNote.findFirst.mockResolvedValue(null);
      await expect(noteService.getById('note-999', 'user-1')).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create a note without tags', async () => {
      prisma.additionalNote.create.mockResolvedValue({
        id: 'note-1', title: 'New Note',
      });
      // getById is called after create
      prisma.additionalNote.findFirst.mockResolvedValue({
        id: 'note-1', title: 'New Note', tags: [],
      });

      const result = await noteService.create('user-1', {
        date: '2024-01-15', title: 'New Note', content: 'Content',
      });
      expect(result).toBeDefined();
      expect(result.title).toBe('New Note');
    });

    it('should create a note with tags', async () => {
      prisma.tag.upsert.mockResolvedValue({ id: 'tag-1', name: 'javascript' });
      prisma.additionalNote.create.mockResolvedValue({
        id: 'note-1', title: 'New Note',
      });
      prisma.noteTag.deleteMany.mockResolvedValue({});
      prisma.noteTag.create.mockResolvedValue({});
      prisma.additionalNote.findFirst.mockResolvedValue({
        id: 'note-1', title: 'New Note', tags: [{ tag: { name: 'javascript' } }],
      });

      const result = await noteService.create('user-1', {
        date: '2024-01-15', title: 'New Note', content: 'Content', tags: ['javascript'],
      });
      expect(result).toBeDefined();
      expect(result.tags).toEqual(['javascript']);
    });
  });

  describe('update', () => {
    it('should throw 404 if note not found', async () => {
      prisma.additionalNote.findFirst.mockResolvedValue(null);
      await expect(noteService.update('note-999', 'user-1', {})).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete a note', async () => {
      prisma.additionalNote.findFirst.mockResolvedValue({ id: 'note-1', userId: 'user-1' });
      prisma.additionalNote.delete.mockResolvedValue({});

      await noteService.delete('note-1', 'user-1');
      expect(prisma.additionalNote.delete).toHaveBeenCalled();
    });

    it('should throw 404 if note not found', async () => {
      prisma.additionalNote.findFirst.mockResolvedValue(null);
      await expect(noteService.delete('note-999', 'user-1')).rejects.toThrow(AppError);
    });
  });

  describe('listTags', () => {
    it('should return tags', async () => {
      prisma.tag.findMany.mockResolvedValue([{ id: 'tag-1', name: 'javascript' }]);
      const result = await noteService.listTags();
      expect(result).toHaveLength(1);
    });

    it('should filter tags by search', async () => {
      prisma.tag.findMany.mockResolvedValue([]);
      await noteService.listTags('java');
      expect(prisma.tag.findMany).toHaveBeenCalled();
    });
  });
});
