import { Router } from 'express';
import { issueController } from '../controllers/issue.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createIssueValidation, updateIssueValidation, resolveIssueValidation } from '../validators/issue';

const router = Router();

router.use(authenticate);

router.get('/', issueController.list.bind(issueController));
router.get('/:id', issueController.getById.bind(issueController));
router.post('/', validate(createIssueValidation), issueController.create.bind(issueController));
router.put('/:id', validate(updateIssueValidation), issueController.update.bind(issueController));
router.patch('/:id/resolve', validate(resolveIssueValidation), issueController.resolve.bind(issueController));
router.delete('/:id', issueController.delete.bind(issueController));

export default router;
