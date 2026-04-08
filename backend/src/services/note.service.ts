import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { NoteFilterQuery } from '../types';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler';

export class NoteService {
  async list(userId: string, query: NoteFilterQuery) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query, 'date');

    const where: Prisma.AdditionalNoteWhereInput = { userId };

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
    if (query.tags) {
      const tagNames = query.tags.split(',').map((t) => t.trim());
      where.tags = { some: { tag: { name: { in: tagNames } } } };
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

  async getById(id: string, userId: string) {
    const note = await prisma.additionalNote.findFirst({
      where: { id, userId },
      include: { tags: { include: { tag: true } } },
    });

    if (!note) {
      throw new AppError(404, 'NOT_FOUND', 'Note not found');
    }

    return {
      ...note,
      tags: note.tags.map((nt) => nt.tag.name),
    };
  }

  async create(
    userId: string,
    data: { date: string; title: string; content: string; tags?: string[] }
  ) {
    const note = await prisma.additionalNote.create({
      data: {
        userId,
        date: new Date(data.date),
        title: data.title,
        content: data.content,
      },
    });

    if (data.tags && data.tags.length > 0) {
      await this.syncTags(note.id, data.tags);
    }

    return this.getById(note.id, userId);
  }

  async update(
    id: string,
    userId: string,
    data: { date?: string; title?: string; content?: string; tags?: string[] }
  ) {
    const note = await prisma.additionalNote.findFirst({ where: { id, userId } });
    if (!note) {
      throw new AppError(404, 'NOT_FOUND', 'Note not found');
    }

    const updateData: Prisma.AdditionalNoteUpdateInput = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;

    await prisma.additionalNote.update({ where: { id }, data: updateData });

    if (data.tags !== undefined) {
      await this.syncTags(id, data.tags);
    }

    return this.getById(id, userId);
  }

  async delete(id: string, userId: string) {
    const note = await prisma.additionalNote.findFirst({ where: { id, userId } });
    if (!note) {
      throw new AppError(404, 'NOT_FOUND', 'Note not found');
    }
    await prisma.additionalNote.delete({ where: { id } });
  }

  async listTags(search?: string) {
    const where: Prisma.TagWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    return prisma.tag.findMany({ where, orderBy: { name: 'asc' } });
  }

  private async syncTags(noteId: string, tagNames: string[]) {
    await prisma.noteTag.deleteMany({ where: { noteId } });

    for (const name of tagNames) {
      const normalizedName = name.toLowerCase().trim();
      const tag = await prisma.tag.upsert({
        where: { name: normalizedName },
        create: { name: normalizedName },
        update: {},
      });
      await prisma.noteTag.create({
        data: { noteId, tagId: tag.id },
      });
    }
  }
}

export const noteService = new NoteService();
