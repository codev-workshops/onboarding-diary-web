import { body } from 'express-validator';

const severities = ['low', 'medium', 'high', 'critical'];
const statuses = ['open', 'in_progress', 'resolved', 'closed'];

export const createIssueValidation = [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required (YYYY-MM-DD)'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Description must be between 10 and 10000 characters'),
  body('severity')
    .optional()
    .isIn(severities)
    .withMessage(`Severity must be one of: ${severities.join(', ')}`),
  body('status')
    .optional()
    .isIn(statuses)
    .withMessage(`Status must be one of: ${statuses.join(', ')}`),
];

export const updateIssueValidation = [
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
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Description must be between 10 and 10000 characters'),
  body('severity')
    .optional()
    .isIn(severities)
    .withMessage(`Severity must be one of: ${severities.join(', ')}`),
  body('status')
    .optional()
    .isIn(statuses)
    .withMessage(`Status must be one of: ${statuses.join(', ')}`),
  body('resolutionNotes')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Resolution notes must be at most 5000 characters'),
];

export const resolveIssueValidation = [
  body('resolutionNotes')
    .trim()
    .notEmpty()
    .withMessage('Resolution notes are required')
    .isLength({ max: 5000 })
    .withMessage('Resolution notes must be at most 5000 characters'),
];
