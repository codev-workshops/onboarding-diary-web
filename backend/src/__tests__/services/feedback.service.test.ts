import { FeedbackService } from '../../services/feedback.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    feedbackNote: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../../config/database').default;

describe('FeedbackService', () => {
  let feedbackService: FeedbackService;

  beforeEach(() => {
    feedbackService = new FeedbackService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated feedback', async () => {
      prisma.feedbackNote.findMany.mockResolvedValue([{ id: 'fb-1' }]);
      prisma.feedbackNote.count.mockResolvedValue(1);

      const result = await feedbackService.list('user-1', {});
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply type filter', async () => {
      prisma.feedbackNote.findMany.mockResolvedValue([]);
      prisma.feedbackNote.count.mockResolvedValue(0);

      await feedbackService.list('user-1', { type: 'positive' });
      const callArgs = prisma.feedbackNote.findMany.mock.calls[0][0];
      expect(callArgs.where.type).toBe('positive');
    });
  });

  describe('getById', () => {
    it('should return feedback if found', async () => {
      prisma.feedbackNote.findFirst.mockResolvedValue({ id: 'fb-1', subject: 'Test' });
      const result = await feedbackService.getById('fb-1', 'user-1');
      expect(result.id).toBe('fb-1');
    });

    it('should throw 404 if feedback not found', async () => {
      prisma.feedbackNote.findFirst.mockResolvedValue(null);
      await expect(feedbackService.getById('fb-999', 'user-1')).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create feedback', async () => {
      prisma.feedbackNote.create.mockResolvedValue({ id: 'fb-1', subject: 'New Feedback' });
      const result = await feedbackService.create('user-1', {
        date: '2024-01-15', subject: 'New Feedback', type: 'positive' as never, details: 'Great onboarding',
      });
      expect(result.subject).toBe('New Feedback');
    });
  });

  describe('update', () => {
    it('should update feedback', async () => {
      prisma.feedbackNote.findFirst.mockResolvedValue({ id: 'fb-1', userId: 'user-1' });
      prisma.feedbackNote.update.mockResolvedValue({ id: 'fb-1', subject: 'Updated' });
      const result = await feedbackService.update('fb-1', 'user-1', { subject: 'Updated' });
      expect(result.subject).toBe('Updated');
    });

    it('should throw 404 if not found', async () => {
      prisma.feedbackNote.findFirst.mockResolvedValue(null);
      await expect(feedbackService.update('fb-999', 'user-1', {})).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete feedback', async () => {
      prisma.feedbackNote.findFirst.mockResolvedValue({ id: 'fb-1', userId: 'user-1' });
      prisma.feedbackNote.delete.mockResolvedValue({});
      await feedbackService.delete('fb-1', 'user-1');
      expect(prisma.feedbackNote.delete).toHaveBeenCalled();
    });

    it('should throw 404 if not found', async () => {
      prisma.feedbackNote.findFirst.mockResolvedValue(null);
      await expect(feedbackService.delete('fb-999', 'user-1')).rejects.toThrow(AppError);
    });
  });
});
