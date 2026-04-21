import { body } from 'express-validator';

const feedbackTypes = ['positive', 'suggestion', 'concern'];

export const createFeedbackValidation = [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('subject')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  body('type')
    .isIn(feedbackTypes)
    .withMessage(`Type must be one of: ${feedbackTypes.join(', ')}`),
  body('details')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Details must be between 10 and 10000 characters'),
];

export const updateFeedbackValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Subject must be between 3 and 200 characters'),
  body('type')
    .optional()
    .isIn(feedbackTypes)
    .withMessage(`Type must be one of: ${feedbackTypes.join(', ')}`),
  body('details')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Details must be between 10 and 10000 characters'),
];
