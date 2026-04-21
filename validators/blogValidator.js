const { body } = require('express-validator');

const createBlogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Cannot have more than 10 tags');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),

  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL')
];

const updateBlogValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),

  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL')
];

module.exports = {
  createBlogValidation,
  updateBlogValidation,
};
