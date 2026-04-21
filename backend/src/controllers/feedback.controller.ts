import { Response, NextFunction } from 'express';
import { AuthRequest, FeedbackFilterQuery } from '../types';
import { feedbackService } from '../services/feedback.service';

export class FeedbackController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.list(req.user!.userId, req.query as unknown as FeedbackFilterQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const feedback = await feedbackService.getById(req.params.id as string, req.user!.userId);
      res.status(200).json({ feedback });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const feedback = await feedbackService.create(req.user!.userId, req.body);
      res.status(201).json({ feedback });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const feedback = await feedbackService.update(req.params.id as string, req.user!.userId, req.body);
      res.status(200).json({ feedback });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await feedbackService.delete(req.params.id as string, req.user!.userId);
      res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
