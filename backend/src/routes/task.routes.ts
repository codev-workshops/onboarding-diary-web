import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskValidation, updateTaskValidation } from '../validators/task';

const router = Router();

router.use(authenticate);

router.get('/', taskController.list.bind(taskController));
router.get('/:id', taskController.getById.bind(taskController));
router.post('/', validate(createTaskValidation), taskController.create.bind(taskController));
router.put('/:id', validate(updateTaskValidation), taskController.update.bind(taskController));
router.delete('/:id', taskController.delete.bind(taskController));

export default router;
