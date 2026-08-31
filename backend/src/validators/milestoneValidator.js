const { body, validationResult } = require('express-validator');

const validateCreateMilestone = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Milestone name is required')
    .isLength({ max: 120 })
    .withMessage('Milestone name cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'delayed'])
    .withMessage('Invalid milestone status'),
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

const validateUpdateMilestone = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Milestone name cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Milestone name cannot exceed 120 characters'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'delayed'])
    .withMessage('Invalid milestone status'),
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
  validateCreateMilestone,
  validateUpdateMilestone
};
