const express = require('express');
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getCategories,
  getRelatedBlogs,
  getFeaturedBlogs,
  getBlogsByCategory,
  getAllBlogsByCategory,
} = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');
const { createBlogValidation, updateBlogValidation } = require('../validators/blogValidator');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - introduction
 *         - sections
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the blog
 *         title:
 *           type: string
 *           description: The blog title
 *         introduction:
 *           type: string
 *           description: Blog introduction paragraph
 *         summary:
 *           type: string
 *           description: Brief summary of the blog
 *         sections:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               section_number:
 *                 type: integer
 *                 description: Section number for ordering
 *               section_title:
 *                 type: string
 *                 description: Title of the section
 *               section_content:
 *                 type: object
 *                 properties:
 *                   why_it_works:
 *                     type: string
 *                     description: Explanation of why the strategy works
 *                   how_to_implement:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Implementation steps
 *           description: Blog content sections
 *         conclusion:
 *           type: string
 *           description: Blog conclusion
 *         excerpt:
 *           type: string
 *           description: Short description of the blog
 *         formattedDate:
 *           type: string
 *           description: Formatted date for UI display (e.g., "22nd July, 2024")
 *         author:
 *           type: string
 *           description: The author's user ID
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Blog tags
 *         category:
 *           type: string
 *           enum: [digital marketing, seo, social media marketing, content marketing, email marketing, ppc, influencer marketing, video marketing]
 *           description: Blog category
 *         slug:
 *           type: string
 *           description: URL-friendly slug
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           description: Blog status
 *         heroImage:
 *           type: string
 *           description: URL of hero image
 *         thumbnailImage:
 *           type: string
 *           description: URL of thumbnail image
 *         readTime:
 *           type: number
 *           description: Estimated reading time in minutes
 *         readTimeText:
 *           type: string
 *           description: Formatted read time (e.g., "5 min read")
 *         views:
 *           type: number
 *           description: Number of views
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the blog
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               content:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *           description: Blog comments
 *         relatedBlogs:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of related blog IDs
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - introduction
 *               - sections
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Digital Marketing Strategies That Work
 *               introduction:
 *                 type: string
 *                 example: In today's fast-paced digital world, marketing strategies have evolved dramatically from traditional methods to innovative online techniques...
 *               summary:
 *                 type: string
 *                 example: In this blog post, we'll explore some of the most effective digital marketing strategies that can help your business thrive.
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section_number:
 *                       type: integer
 *                       example: 1
 *                     section_title:
 *                       type: string
 *                       example: Content Marketing
 *                     section_content:
 *                       type: object
 *                       properties:
 *                         why_it_works:
 *                           type: string
 *                           example: Content marketing focuses on creating and distributing valuable, relevant, and consistent content to attract and engage a clearly defined audience.
 *                         how_to_implement:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Blogging: Regularly publish informative and engaging blog posts", "E-books and Whitepapers: Offer in-depth resources"]
 *               conclusion:
 *                 type: string
 *                 example: Implementing these digital marketing strategies can significantly boost your online presence and drive business growth.
 *               category:
 *                 type: string
 *                 enum: [digital marketing, seo, social media marketing, content marketing, email marketing, ppc, influencer marketing, video marketing]
 *                 example: digital marketing
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["marketing", "digital", "strategy"]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: draft
 *               heroImage:
 *                 type: string
 *                 example: https://example.com/hero-image.jpg
 *               thumbnailImage:
 *                 type: string
 *                 example: https://example.com/thumbnail.jpg
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, createBlogValidation, handleValidationErrors, createBlog);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of blogs per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *       - in: query
 *         name: listing
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Return listing format (essential fields only) or full blog objects
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Blog'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/', getBlogs);

// Specific routes must come before parameterized routes
router.get('/categories', getCategories);
router.get('/featured', getFeaturedBlogs);
router.get('/category/:category', getBlogsByCategory);
router.get('/category/:category/all', getAllBlogsByCategory);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get single blog post
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID or slug
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog post not found
 */
router.get('/:id', getBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               introduction:
 *                 type: string
 *               summary:
 *                 type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section_number:
 *                       type: integer
 *                     section_title:
 *                       type: string
 *                     section_content:
 *                       type: object
 *                       properties:
 *                         why_it_works:
 *                           type: string
 *                         how_to_implement:
 *                           type: array
 *                           items:
 *                             type: string
 *               conclusion:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               heroImage:
 *                 type: string
 *               thumbnailImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this blog
 *       404:
 *         description: Blog post not found
 */
router.put('/:id', authenticate, updateBlogValidation, handleValidationErrors, updateBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this blog
 *       404:
 *         description: Blog post not found
 */
router.delete('/:id', authenticate, deleteBlog);

/**
 * @swagger
 * /api/blogs/{id}/like:
 *   post:
 *     summary: Like or unlike blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Like status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     likes:
 *                       type: integer
 *                     isLiked:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.post('/:id/like', authenticate, toggleLike);

/**
 * @swagger
 * /api/blogs/{id}/comments:
 *   post:
 *     summary: Add comment to blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great blog post!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog post not found
 */
router.post('/:id/comments', authenticate, addComment);

/**
 * @swagger
 * /api/blogs/categories:
 *   get:
 *     summary: Get all blog categories
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 */
/**
 * @swagger
 * /api/blogs/{id}/related:
 *   get:
 *     summary: Get related blogs for a specific blog
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID or slug
 *     responses:
 *       200:
 *         description: Related blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     relatedBlogs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog post not found
 */
router.get('/:id/related', getRelatedBlogs);

/**
 * @swagger
 * /api/blogs/category/{category}/all:
 *   get:
 *     summary: Get all blogs by specific category (with optional pagination)
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (use with limit for pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of blogs per page (default 50, use -1 to get all without pagination)
 *     responses:
 *       200:
 *         description: Blogs by category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blogs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Blog'
 *                     category:
 *                       type: string
 *                     total:
 *                       type: integer
 *                     pagination:
 *                       type: object
 *                       description: Pagination info (only included when limit != -1)
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 */
router.get('/category/:category/all', getAllBlogsByCategory);

module.exports = router;
