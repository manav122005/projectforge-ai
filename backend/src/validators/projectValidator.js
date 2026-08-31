const { body, validationResult } = require('express-validator');

const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 120 })
    .withMessage('Project name cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('originalIdea')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Original idea cannot exceed 5000 characters'),
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

const validateUpdateProject = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Project name cannot exceed 120 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'planning', 'active', 'paused', 'completed', 'archived'])
    .withMessage('Invalid project status'),
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
  validateCreateProject,
  validateUpdateProject
};
