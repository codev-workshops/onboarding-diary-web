import { Response, NextFunction } from 'express';
import { AuthRequest, TaskFilterQuery } from '../types';
import { taskService } from '../services/task.service';

export class TaskController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.list(req.user!.userId, req.query as unknown as TaskFilterQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getById(req.params.id as string, req.user!.userId);
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(req.user!.userId, req.body);
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id as string, req.user!.userId, req.body);
      res.status(200).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id as string, req.user!.userId);
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
