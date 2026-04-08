import { Response, NextFunction } from 'express';
import { AuthRequest, IssueFilterQuery } from '../types';
import { issueService } from '../services/issue.service';

export class IssueController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await issueService.list(req.user!.userId, req.query as unknown as IssueFilterQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getById(req.params.id as string, req.user!.userId);
      res.status(200).json({ issue });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.create(req.user!.userId, req.body);
      res.status(201).json({ issue });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.update(req.params.id as string, req.user!.userId, req.body);
      res.status(200).json({ issue });
    } catch (error) {
      next(error);
    }
  }

  async resolve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.resolve(req.params.id as string, req.user!.userId, req.body.resolutionNotes);
      res.status(200).json({ issue });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await issueService.delete(req.params.id as string, req.user!.userId);
      res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const issueController = new IssueController();
