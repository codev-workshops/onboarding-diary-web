import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', dashboardController.getSummary.bind(dashboardController));
router.get('/recent', dashboardController.getRecentEntries.bind(dashboardController));
router.get('/manager', authorize('manager', 'admin'), dashboardController.getManagerDashboard.bind(dashboardController));
router.get('/manager/recruits/:id', authorize('manager', 'admin'), dashboardController.getRecruitDashboard.bind(dashboardController));

export default router;
