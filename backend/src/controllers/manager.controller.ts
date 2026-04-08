import { Response, NextFunction } from 'express';
import { AuthRequest, TaskFilterQuery, IssueFilterQuery, FeedbackFilterQuery, NoteFilterQuery, PaginationQuery } from '../types';
import { managerService } from '../services/manager.service';

export class ManagerController {
  async listRecruits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await managerService.listRecruits(req.user!.userId, req.query as unknown as PaginationQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecruitTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await managerService.getRecruitTasks(
        req.params.id as string,
        req.user!.userId,
        req.query as unknown as TaskFilterQuery
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecruitIssues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await managerService.getRecruitIssues(
        req.params.id as string,
        req.user!.userId,
        req.query as unknown as IssueFilterQuery
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecruitFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await managerService.getRecruitFeedback(
        req.params.id as string,
        req.user!.userId,
        req.query as unknown as FeedbackFilterQuery
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecruitNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await managerService.getRecruitNotes(
        req.params.id as string,
        req.user!.userId,
        req.query as unknown as NoteFilterQuery
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const managerController = new ManagerController();
