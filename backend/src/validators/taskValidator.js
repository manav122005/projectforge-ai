const { body, validationResult } = require('express-validator');

const validateCreateTask = [
  body('milestoneId')
    .notEmpty()
    .withMessage('Milestone ID is required')
    .isMongoId()
    .withMessage('Invalid Milestone ID format'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 160 })
    .withMessage('Task title cannot exceed 160 characters'),
  body('status')
    .optional()
    .isIn(['backlog', 'todo', 'in_progress', 'blocked', 'review', 'completed'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid task priority'),
  body('estimatedHours')
    .notEmpty()
    .withMessage('Estimated hours is required')
    .isFloat({ min: 0.5 })
    .withMessage('Estimated hours must be a positive number (minimum 0.5)'),
  body('assignedMember')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Assigned Member ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.array()[0].msg,
          details: errors.array().map((err) => ({ field: err.path, message: err.msg }))
        }
      });
    }
    next();
  }
];

const validateUpdateTask = [
  body('status')
    .optional()
    .isIn(['backlog', 'todo', 'in_progress', 'blocked', 'review', 'completed'])
    .withMessage('Invalid task status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid task priority'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5 })
    .withMessage('Estimated hours must be a positive number (minimum 0.5)'),
  body('assignedMember')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid Assigned Member ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.array()[0].msg,
          details: errors.array().map((err) => ({ field: err.path, message: err.msg }))
        }
      });
    }
    next();
  }
];

module.exports = {
  validateCreateTask,
  validateUpdateTask
};
