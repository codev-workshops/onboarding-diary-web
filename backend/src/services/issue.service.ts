import { IssueSeverity, IssueStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { IssueFilterQuery } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

export class IssueService {
  async list(userId: string, query: IssueFilterQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');

    const where: Prisma.IssueLogWhereInput = { userId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.status) where.status = query.status as IssueStatus;
    if (query.severity) where.severity = query.severity as IssueSeverity;

    const [issues, total] = await Promise.all([
      prisma.issueLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.issueLog.count({ where }),
    ]);

    return buildPaginatedResponse(issues, total, page, limit);
  }

  async getById(id: string, userId: string) {
    const issue = await prisma.issueLog.findFirst({ where: { id, userId } });
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }
    return issue;
  }

  async create(
    userId: string,
    data: {
      date: string;
      title: string;
      description: string;
      severity?: IssueSeverity;
      status?: IssueStatus;
    }
  ) {
    return prisma.issueLog.create({
      data: {
        userId,
        date: new Date(data.date),
        title: data.title,
        description: data.description,
        severity: data.severity || 'medium',
        status: data.status || 'open',
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: {
      date?: string;
      title?: string;
      description?: string;
      severity?: IssueSeverity;
      status?: IssueStatus;
      resolutionNotes?: string;
    }
  ) {
    const issue = await prisma.issueLog.findFirst({ where: { id, userId } });
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }

    const updateData: Prisma.IssueLogUpdateInput = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.resolutionNotes !== undefined) updateData.resolutionNotes = data.resolutionNotes;

    return prisma.issueLog.update({ where: { id }, data: updateData });
  }

  async resolve(id: string, userId: string, resolutionNotes: string) {
    const issue = await prisma.issueLog.findFirst({ where: { id, userId } });
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }

    return prisma.issueLog.update({
      where: { id },
      data: {
        status: 'resolved',
        resolutionNotes,
        resolvedAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    const issue = await prisma.issueLog.findFirst({ where: { id, userId } });
    if (!issue) {
      throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    }
    await prisma.issueLog.delete({ where: { id } });
  }
}

export const issueService = new IssueService();
