import { Response, NextFunction } from 'express';
import { ReportController } from '../../controllers/report.controller';
import { AuthRequest } from '../../types';

jest.mock('../../services/report.service', () => ({
  reportService: {
    generateReport: jest.fn(),
    formatReportAsCsv: jest.fn(),
    generateManagerReport: jest.fn(),
    generateCombinedManagerReport: jest.fn(),
  },
}));

import { reportService } from '../../services/report.service';

describe('ReportController', () => {
  let controller: ReportController;
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ReportController();
    mockReq = { body: {}, query: {}, params: {}, user: { userId: 'user-1', email: 'test@example.com', role: 'recruit' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('generateReport should return 200 JSON', async () => {
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31', categories: 'tasks' };
    (reportService.generateReport as jest.Mock).mockResolvedValue({ tasks: [] });
    await controller.generateReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('generateReport should return CSV when format=csv', async () => {
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31', categories: 'tasks', format: 'csv' };
    (reportService.generateReport as jest.Mock).mockResolvedValue({ tasks: [] });
    (reportService.formatReportAsCsv as jest.Mock).mockReturnValue('csv-data');
    await controller.generateReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockRes.send).toHaveBeenCalledWith('csv-data');
  });

  it('generateReport should use defaults when no categories', async () => {
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31' };
    (reportService.generateReport as jest.Mock).mockResolvedValue({});
    await controller.generateReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(reportService.generateReport).toHaveBeenCalledWith('user-1', '2024-01-01', '2024-12-31', ['tasks', 'issues', 'feedback', 'notes']);
  });

  it('generateReport should call next on error', async () => {
    (reportService.generateReport as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.generateReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('previewReport should return 200', async () => {
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31', categories: 'tasks' };
    (reportService.generateReport as jest.Mock).mockResolvedValue({});
    await controller.previewReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('previewReport should call next on error', async () => {
    (reportService.generateReport as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.previewReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('generateManagerReport should return 200', async () => {
    mockReq.params = { id: 'recruit-1' };
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31', categories: 'tasks' };
    (reportService.generateManagerReport as jest.Mock).mockResolvedValue({});
    await controller.generateManagerReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('generateManagerReport should return CSV when format=csv', async () => {
    mockReq.params = { id: 'recruit-1' };
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31', categories: 'tasks', format: 'csv' };
    (reportService.generateManagerReport as jest.Mock).mockResolvedValue({});
    (reportService.formatReportAsCsv as jest.Mock).mockReturnValue('csv-data');
    await controller.generateManagerReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.send).toHaveBeenCalledWith('csv-data');
  });

  it('generateManagerReport should call next on error', async () => {
    mockReq.params = { id: 'recruit-1' };
    (reportService.generateManagerReport as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.generateManagerReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('generateCombinedReport should return 200', async () => {
    mockReq.query = { dateFrom: '2024-01-01', dateTo: '2024-12-31', categories: 'tasks' };
    (reportService.generateCombinedManagerReport as jest.Mock).mockResolvedValue([]);
    await controller.generateCombinedReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('generateCombinedReport should call next on error', async () => {
    (reportService.generateCombinedManagerReport as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.generateCombinedReport(mockReq as AuthRequest, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
