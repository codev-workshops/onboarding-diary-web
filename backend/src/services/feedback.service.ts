import { FeedbackType, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { FeedbackFilterQuery } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

export class FeedbackService {
  async list(userId: string, query: FeedbackFilterQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');

    const where: Prisma.FeedbackNoteWhereInput = { userId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.type) where.type = query.type as FeedbackType;

    const [feedback, total] = await Promise.all([
      prisma.feedbackNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.feedbackNote.count({ where }),
    ]);

    return buildPaginatedResponse(feedback, total, page, limit);
  }

  async getById(id: string, userId: string) {
    const feedback = await prisma.feedbackNote.findFirst({ where: { id, userId } });
    if (!feedback) {
      throw new AppError(404, 'NOT_FOUND', 'Feedback not found');
    }
    return feedback;
  }

  async create(
    userId: string,
    data: { date: string; subject: string; type: FeedbackType; details: string }
  ) {
    return prisma.feedbackNote.create({
      data: {
        userId,
        date: new Date(data.date),
        subject: data.subject,
        type: data.type,
        details: data.details,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    data: { date?: string; subject?: string; type?: FeedbackType; details?: string }
  ) {
    const feedback = await prisma.feedbackNote.findFirst({ where: { id, userId } });
    if (!feedback) {
      throw new AppError(404, 'NOT_FOUND', 'Feedback not found');
    }

    const updateData: Prisma.FeedbackNoteUpdateInput = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.details !== undefined) updateData.details = data.details;

    return prisma.feedbackNote.update({ where: { id }, data: updateData });
  }

  async delete(id: string, userId: string) {
    const feedback = await prisma.feedbackNote.findFirst({ where: { id, userId } });
    if (!feedback) {
      throw new AppError(404, 'NOT_FOUND', 'Feedback not found');
    }
    await prisma.feedbackNote.delete({ where: { id } });
  }
}

export const feedbackService = new FeedbackService();
