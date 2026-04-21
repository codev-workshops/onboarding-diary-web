import { Response, NextFunction } from 'express';
import { AuthRequest, NoteFilterQuery } from '../types';
import { noteService } from '../services/note.service';

export class NoteController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await noteService.list(req.user!.userId, req.query as unknown as NoteFilterQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const note = await noteService.getById(req.params.id as string, req.user!.userId);
      res.status(200).json({ note });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const note = await noteService.create(req.user!.userId, req.body);
      res.status(201).json({ note });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const note = await noteService.update(req.params.id as string, req.user!.userId, req.body);
      res.status(200).json({ note });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await noteService.delete(req.params.id as string, req.user!.userId);
      res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async listTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tags = await noteService.listTags(req.query.search as string);
      res.status(200).json({ tags });
    } catch (error) {
      next(error);
    }
  }
}

export const noteController = new NoteController();
