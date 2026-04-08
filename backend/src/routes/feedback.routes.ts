import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFeedbackValidation, updateFeedbackValidation } from '../validators/feedback';

const router = Router();

router.use(authenticate);

router.get('/', feedbackController.list.bind(feedbackController));
router.get('/:id', feedbackController.getById.bind(feedbackController));
router.post('/', validate(createFeedbackValidation), feedbackController.create.bind(feedbackController));
router.put('/:id', validate(updateFeedbackValidation), feedbackController.update.bind(feedbackController));
router.delete('/:id', feedbackController.delete.bind(feedbackController));

export default router;
