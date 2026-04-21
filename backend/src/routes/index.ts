import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import taskRoutes from './task.routes';
import issueRoutes from './issue.routes';
import feedbackRoutes from './feedback.routes';
import noteRoutes from './note.routes';
import tagRoutes from './tag.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import adminRoutes from './admin.routes';
import managerRoutes from './manager.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/tasks', taskRoutes);
router.use('/issues', issueRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notes', noteRoutes);
router.use('/tags', tagRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/manager', managerRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
