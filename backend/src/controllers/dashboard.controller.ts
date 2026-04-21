import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary(req.user!.userId);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  }

  async getRecentEntries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentEntries = await dashboardService.getRecentEntries(req.user!.userId, limit);
      res.status(200).json({ recentEntries });
    } catch (error) {
      next(error);
    }
  }

  async getManagerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruits = await dashboardService.getManagerDashboard(req.user!.userId);
      res.status(200).json({ recruits });
    } catch (error) {
      next(error);
    }
  }

  async getRecruitDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getRecruitDashboard(req.params.id as string, req.user!.userId);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
