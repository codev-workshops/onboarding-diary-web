import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileValidation, changePasswordValidation } from '../validators/profile';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile.bind(profileController));
router.patch('/', validate(updateProfileValidation), profileController.updateProfile.bind(profileController));
router.patch('/password', validate(changePasswordValidation), profileController.changePassword.bind(profileController));

export default router;
