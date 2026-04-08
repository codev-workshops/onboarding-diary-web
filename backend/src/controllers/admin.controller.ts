import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { adminService } from '../services/admin.service';

export class AdminController {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.listUsers(req.query as Record<string, string>);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUserById(req.params.id as string);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.createUser(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUser(req.params.id as string, req.body);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.deactivateUser(req.params.id as string);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.activateUser(req.params.id as string);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await adminService.deleteUser(req.params.id as string, req.body.confirmEmail);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
