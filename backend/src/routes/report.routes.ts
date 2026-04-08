import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', reportController.generateReport.bind(reportController));
router.get('/preview', reportController.previewReport.bind(reportController));
router.get('/manager/recruits/:id', authorize('manager', 'admin'), reportController.generateManagerReport.bind(reportController));
router.get('/manager', authorize('manager', 'admin'), reportController.generateCombinedReport.bind(reportController));

export default router;
