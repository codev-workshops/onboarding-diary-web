import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import {
  signupValidation,
  loginValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validators/auth';

const router = Router();

router.post('/signup', validate(signupValidation), authController.signup.bind(authController));
router.post('/login', validate(loginValidation), authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', validate(refreshTokenValidation), authController.refresh.bind(authController));
router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword.bind(authController));

export default router;
