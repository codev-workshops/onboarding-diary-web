import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { reportService } from '../services/report.service';

export class ReportController {
  async generateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, categories, format } = req.query as Record<string, string>;
      const categoryList = categories ? categories.split(',') : ['tasks', 'issues', 'feedback', 'notes'];

      const report = await reportService.generateReport(req.user!.userId, dateFrom, dateTo, categoryList);

      if (format === 'csv') {
        const csv = reportService.formatReportAsCsv(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
        res.status(200).send(csv);
        return;
      }

      res.status(200).json({ report });
    } catch (error) {
      next(error);
    }
  }

  async previewReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, categories } = req.query as Record<string, string>;
      const categoryList = categories ? categories.split(',') : ['tasks', 'issues', 'feedback', 'notes'];

      const reportData = await reportService.generateReport(req.user!.userId, dateFrom, dateTo, categoryList);
      res.status(200).json({ reportData });
    } catch (error) {
      next(error);
    }
  }

  async generateManagerReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, categories, format } = req.query as Record<string, string>;
      const categoryList = categories ? categories.split(',') : ['tasks', 'issues', 'feedback', 'notes'];

      const report = await reportService.generateManagerReport(
        req.user!.userId,
        req.params.id as string,
        dateFrom,
        dateTo,
        categoryList
      );

      if (format === 'csv') {
        const csv = reportService.formatReportAsCsv(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=recruit-report.csv');
        res.status(200).send(csv);
        return;
      }

      res.status(200).json({ report });
    } catch (error) {
      next(error);
    }
  }

  async generateCombinedReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo, categories } = req.query as Record<string, string>;
      const categoryList = categories ? categories.split(',') : ['tasks', 'issues', 'feedback', 'notes'];

      const reports = await reportService.generateCombinedManagerReport(
        req.user!.userId,
        dateFrom,
        dateTo,
        categoryList
      );

      res.status(200).json({ reports });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
