const { body } = require('express-validator');

const createBlogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('introduction')
    .trim()
    .notEmpty()
    .withMessage('Introduction is required')
    .isLength({ max: 1000 })
    .withMessage('Introduction cannot exceed 1000 characters'),

  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary cannot exceed 500 characters'),

  body('sections')
    .isArray()
    .withMessage('Sections must be an array')
    .custom((sections) => {
      if (sections.length === 0) {
        throw new Error('At least one section is required');
      }
      return true;
    }),

  body('sections.*.section_number')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Section number must be a positive integer'),

  body('sections.*.section_title')
    .trim()
    .notEmpty()
    .withMessage('Section title is required'),

  body('sections.*.section_content.why_it_works')
    .trim()
    .notEmpty()
    .withMessage('Why it works is required for each section'),

  body('sections.*.section_content.how_to_implement')
    .isArray()
    .withMessage('How to implement must be an array')
    .custom((items) => {
      if (items.length === 0) {
        throw new Error('At least one implementation step is required');
      }
      return true;
    }),

  body('conclusion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Conclusion cannot exceed 1000 characters'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['digital marketing', 'seo', 'social media marketing', 'content marketing', 'email marketing', 'ppc', 'influencer marketing', 'video marketing'])
    .withMessage('Invalid category'),

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

  body('heroImage')
    .optional()
    .isURL()
    .withMessage('Hero image must be a valid URL'),

  body('thumbnailImage')
    .optional()
    .isURL()
    .withMessage('Thumbnail image must be a valid URL'),

  body('relatedBlogs')
    .optional()
    .isArray()
    .withMessage('Related blogs must be an array')
];

const updateBlogValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('introduction')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Introduction cannot exceed 1000 characters'),

  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary cannot exceed 500 characters'),

  body('sections')
    .optional()
    .isArray()
    .withMessage('Sections must be an array'),

  body('sections.*.section_number')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Section number must be a positive integer'),

  body('sections.*.section_title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Section title cannot be empty'),

  body('sections.*.section_content.why_it_works')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Why it works cannot be empty'),

  body('sections.*.section_content.how_to_implement')
    .optional()
    .isArray()
    .withMessage('How to implement must be an array'),

  body('conclusion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Conclusion cannot exceed 1000 characters'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isIn(['digital marketing', 'seo', 'social media marketing', 'content marketing', 'email marketing', 'ppc', 'influencer marketing', 'video marketing'])
    .withMessage('Invalid category'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),

  body('heroImage')
    .optional()
    .isURL()
    .withMessage('Hero image must be a valid URL'),

  body('thumbnailImage')
    .optional()
    .isURL()
    .withMessage('Thumbnail image must be a valid URL'),

  body('relatedBlogs')
    .optional()
    .isArray()
    .withMessage('Related blogs must be an array')
];

module.exports = {
  createBlogValidation,
  updateBlogValidation,
};
