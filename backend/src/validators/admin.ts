import { body } from 'express-validator';

const roles = ['recruit', 'manager', 'admin'];

export const createUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be at most 255 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .isIn(roles)
    .withMessage(`Role must be one of: ${roles.join(', ')}`),
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must be at most 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('managerId')
    .optional()
    .isUUID()
    .withMessage('Manager ID must be a valid UUID'),
];

export const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(roles)
    .withMessage(`Role must be one of: ${roles.join(', ')}`),
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department must be at most 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('managerId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Manager ID must be a valid UUID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];
