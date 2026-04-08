import { body } from 'express-validator';

const taskCategories = ['learning', 'setup', 'meeting', 'coding', 'documentation', 'other'];
const taskStatuses = ['not_started', 'in_progress', 'completed', 'deferred'];
const taskPriorities = ['low', 'medium', 'high', 'urgent'];

export const createTaskValidation = [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must be at most 5000 characters'),
  body('category')
    .isIn(taskCategories)
    .withMessage(`Category must be one of: ${taskCategories.join(', ')}`),
  body('status')
    .optional()
    .isIn(taskStatuses)
    .withMessage(`Status must be one of: ${taskStatuses.join(', ')}`),
  body('priority')
    .optional()
    .isIn(taskPriorities)
    .withMessage(`Priority must be one of: ${taskPriorities.join(', ')}`),
];

export const updateTaskValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description must be at most 5000 characters'),
  body('category')
    .optional()
    .isIn(taskCategories)
    .withMessage(`Category must be one of: ${taskCategories.join(', ')}`),
  body('status')
    .optional()
    .isIn(taskStatuses)
    .withMessage(`Status must be one of: ${taskStatuses.join(', ')}`),
  body('priority')
    .optional()
    .isIn(taskPriorities)
    .withMessage(`Priority must be one of: ${taskPriorities.join(', ')}`),
];
