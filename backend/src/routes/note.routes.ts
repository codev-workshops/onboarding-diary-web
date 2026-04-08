import { Router } from 'express';
import { noteController } from '../controllers/note.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNoteValidation, updateNoteValidation } from '../validators/note';

const router = Router();

router.use(authenticate);

router.get('/', noteController.list.bind(noteController));
router.get('/:id', noteController.getById.bind(noteController));
router.post('/', validate(createNoteValidation), noteController.create.bind(noteController));
router.put('/:id', validate(updateNoteValidation), noteController.update.bind(noteController));
router.delete('/:id', noteController.delete.bind(noteController));

export default router;
