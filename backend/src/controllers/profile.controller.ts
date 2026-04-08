import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { profileService } from '../services/profile.service';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await profileService.getProfile(req.user!.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await profileService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await profileService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
