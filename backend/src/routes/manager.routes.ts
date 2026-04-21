import { Router } from 'express';
import { managerController } from '../controllers/manager.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('manager', 'admin'));

router.get('/recruits', managerController.listRecruits.bind(managerController));
router.get('/recruits/:id/tasks', managerController.getRecruitTasks.bind(managerController));
router.get('/recruits/:id/issues', managerController.getRecruitIssues.bind(managerController));
router.get('/recruits/:id/feedback', managerController.getRecruitFeedback.bind(managerController));
router.get('/recruits/:id/notes', managerController.getRecruitNotes.bind(managerController));

export default router;
