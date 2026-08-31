const { body, validationResult } = require('express-validator');

const validateAddMember = [
  body('displayName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Display name cannot be empty'),
  body('experienceLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid experience level'),
  body('availabilityHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Availability hours cannot be negative'),
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
  validateAddMember
};
