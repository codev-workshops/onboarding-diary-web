import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserValidation, updateUserValidation } from '../validators/admin';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.listUsers.bind(adminController));
router.get('/users/:id', adminController.getUserById.bind(adminController));
router.post('/users', validate(createUserValidation), adminController.createUser.bind(adminController));
router.put('/users/:id', validate(updateUserValidation), adminController.updateUser.bind(adminController));
router.patch('/users/:id/deactivate', adminController.deactivateUser.bind(adminController));
router.patch('/users/:id/activate', adminController.activateUser.bind(adminController));
router.delete('/users/:id', adminController.deleteUser.bind(adminController));

export default router;
