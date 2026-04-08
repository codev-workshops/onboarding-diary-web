import { TaskCategory, TaskStatus, TaskPriority, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { TaskFilterQuery } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

export class TaskService {
  async list(userId: string, query: TaskFilterQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');

    const where: Prisma.TaskLogWhereInput = { userId };

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }
    if (query.category) where.category = query.category as TaskCategory;
    if (query.status) where.status = query.status as TaskStatus;

    const [tasks, total] = await Promise.all([
      prisma.taskLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.taskLog.count({ where }),
    ]);

    return buildPaginatedResponse(tasks, total, page, limit);
  }

  async getById(id: string, userId: string) {
    const task = await prisma.taskLog.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    return task;
  }

  async create(
    userId: string,
    data: {
      date: string;
      title: string;
      description?: string;
      category: TaskCategory;
      status?: TaskStatus;
      priority?: TaskPriority;
    }
  ) {
    return prisma.taskLog.create({
      data: {
        userId,
        date: new Date(data.date),
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status || 'not_started',
        priority: data.priority || 'medium',
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
      category?: TaskCategory;
      status?: TaskStatus;
      priority?: TaskPriority;
    }
  ) {
    const task = await prisma.taskLog.findFirst({ where: { id, userId } });
    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    const updateData: Prisma.TaskLogUpdateInput = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;

    return prisma.taskLog.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string) {
    const task = await prisma.taskLog.findFirst({ where: { id, userId } });
    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    await prisma.taskLog.delete({ where: { id } });
  }
}

export const taskService = new TaskService();
