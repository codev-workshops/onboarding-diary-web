import { TaskService } from '../../services/task.service';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    taskLog: {
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

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated tasks', async () => {
      const mockTasks = [
        { id: 'task-1', title: 'Task 1', userId: 'user-1' },
        { id: 'task-2', title: 'Task 2', userId: 'user-1' },
      ];
      prisma.taskLog.findMany.mockResolvedValue(mockTasks);
      prisma.taskLog.count.mockResolvedValue(2);

      const result = await taskService.list('user-1', {});
      expect(result.data).toEqual(mockTasks);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply filters', async () => {
      prisma.taskLog.findMany.mockResolvedValue([]);
      prisma.taskLog.count.mockResolvedValue(0);

      await taskService.list('user-1', {
        status: 'completed',
        category: 'coding',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
      });

      expect(prisma.taskLog.findMany).toHaveBeenCalled();
      const callArgs = prisma.taskLog.findMany.mock.calls[0][0];
      expect(callArgs.where.userId).toBe('user-1');
      expect(callArgs.where.status).toBe('completed');
      expect(callArgs.where.category).toBe('coding');
      expect(callArgs.where.date).toBeDefined();
    });

    it('should apply pagination', async () => {
      prisma.taskLog.findMany.mockResolvedValue([]);
      prisma.taskLog.count.mockResolvedValue(50);

      const result = await taskService.list('user-1', { page: '2', limit: '5' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(10);
    });
  });

  describe('getById', () => {
    it('should return a task if found', async () => {
      const mockTask = { id: 'task-1', title: 'Task 1', userId: 'user-1' };
      prisma.taskLog.findFirst.mockResolvedValue(mockTask);

      const result = await taskService.getById('task-1', 'user-1');
      expect(result).toEqual(mockTask);
    });

    it('should throw 404 if task not found', async () => {
      prisma.taskLog.findFirst.mockResolvedValue(null);

      await expect(taskService.getById('task-999', 'user-1')).rejects.toThrow(AppError);
      try {
        await taskService.getById('task-999', 'user-1');
      } catch (err) {
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });

  describe('create', () => {
    it('should create a task with default values', async () => {
      const mockTask = {
        id: 'task-1',
        userId: 'user-1',
        date: new Date('2024-01-15'),
        title: 'New Task',
        category: 'coding',
        status: 'not_started',
        priority: 'medium',
      };
      prisma.taskLog.create.mockResolvedValue(mockTask);

      const result = await taskService.create('user-1', {
        date: '2024-01-15',
        title: 'New Task',
        category: 'coding' as never,
      });

      expect(result).toEqual(mockTask);
      expect(prisma.taskLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          title: 'New Task',
          status: 'not_started',
          priority: 'medium',
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      prisma.taskLog.findFirst.mockResolvedValue({ id: 'task-1', userId: 'user-1' });
      prisma.taskLog.update.mockResolvedValue({
        id: 'task-1',
        title: 'Updated Task',
        status: 'completed',
      });

      const result = await taskService.update('task-1', 'user-1', {
        title: 'Updated Task',
        status: 'completed' as never,
      });

      expect(result.title).toBe('Updated Task');
    });

    it('should throw 404 if task not found', async () => {
      prisma.taskLog.findFirst.mockResolvedValue(null);

      await expect(
        taskService.update('task-999', 'user-1', { title: 'Test' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      prisma.taskLog.findFirst.mockResolvedValue({ id: 'task-1', userId: 'user-1' });
      prisma.taskLog.delete.mockResolvedValue({});

      await taskService.delete('task-1', 'user-1');
      expect(prisma.taskLog.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('should throw 404 if task not found', async () => {
      prisma.taskLog.findFirst.mockResolvedValue(null);

      await expect(taskService.delete('task-999', 'user-1')).rejects.toThrow(AppError);
    });
  });
});
