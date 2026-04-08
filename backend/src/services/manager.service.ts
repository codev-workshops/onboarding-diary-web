import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { TaskFilterQuery, IssueFilterQuery, FeedbackFilterQuery, NoteFilterQuery, PaginationQuery } from '../types';
import { TaskCategory, TaskStatus, IssueSeverity, IssueStatus, FeedbackType, Prisma } from '@prisma/client';

export class ManagerService {
  async listRecruits(managerId: string, query: PaginationQuery) {
    const { page, limit, skip } = parsePagination(query, 'name');

    const where: Prisma.UserWhereInput = { managerId, role: 'recruit', isActive: true };

    const [recruits, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          startDate: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(recruits, total, page, limit);
  }

  async verifyRecruitAccess(recruitId: string, managerId: string) {
    const recruit = await prisma.user.findFirst({
      where: { id: recruitId, managerId, role: 'recruit' },
    });
    if (!recruit) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have access to this recruit');
    }
    return recruit;
  }

  async getRecruitTasks(recruitId: string, managerId: string, query: TaskFilterQuery) {
    await this.verifyRecruitAccess(recruitId, managerId);

    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');
    const where: Prisma.TaskLogWhereInput = { userId: recruitId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.category) where.category = query.category as TaskCategory;
    if (query.status) where.status = query.status as TaskStatus;

    const [tasks, total] = await Promise.all([
      prisma.taskLog.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.taskLog.count({ where }),
    ]);

    return buildPaginatedResponse(tasks, total, page, limit);
  }

  async getRecruitIssues(recruitId: string, managerId: string, query: IssueFilterQuery) {
    await this.verifyRecruitAccess(recruitId, managerId);

    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');
    const where: Prisma.IssueLogWhereInput = { userId: recruitId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.status) where.status = query.status as IssueStatus;
    if (query.severity) where.severity = query.severity as IssueSeverity;

    const [issues, total] = await Promise.all([
      prisma.issueLog.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.issueLog.count({ where }),
    ]);

    return buildPaginatedResponse(issues, total, page, limit);
  }

  async getRecruitFeedback(recruitId: string, managerId: string, query: FeedbackFilterQuery) {
    await this.verifyRecruitAccess(recruitId, managerId);

    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');
    const where: Prisma.FeedbackNoteWhereInput = { userId: recruitId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.type) where.type = query.type as FeedbackType;

    const [feedback, total] = await Promise.all([
      prisma.feedbackNote.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
      prisma.feedbackNote.count({ where }),
    ]);

    return buildPaginatedResponse(feedback, total, page, limit);
  }

  async getRecruitNotes(recruitId: string, managerId: string, query: NoteFilterQuery) {
    await this.verifyRecruitAccess(recruitId, managerId);

    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');
    const where: Prisma.AdditionalNoteWhereInput = { userId: recruitId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.additionalNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { tags: { include: { tag: true } } },
      }),
      prisma.additionalNote.count({ where }),
    ]);

    const formatted = notes.map((note) => ({
      ...note,
      tags: note.tags.map((nt) => nt.tag.name),
    }));

    return buildPaginatedResponse(formatted, total, page, limit);
  }
}

export const managerService = new ManagerService();
