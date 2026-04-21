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
 *         - content
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the blog
 *         title:
 *           type: string
 *           description: The blog title
 *         content:
 *           type: string
 *           description: The blog content
 *         excerpt:
 *           type: string
 *           description: Short description of the blog
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
 *           description: Blog category
 *         slug:
 *           type: string
 *           description: URL-friendly slug
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           description: Blog status
 *         featuredImage:
 *           type: string
 *           description: URL of featured image
 *         readTime:
 *           type: number
 *           description: Estimated reading time in minutes
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
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: My First Blog Post
 *               content:
 *                 type: string
 *                 example: This is the content of my blog post...
 *               excerpt:
 *                 type: string
 *                 example: A short summary of my blog post
 *               category:
 *                 type: string
 *                 example: technology
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nodejs", "mongodb", "api"]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: draft
 *               featuredImage:
 *                 type: string
 *                 example: https://example.com/image.jpg
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
 *               content:
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
 *               featuredImage:
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
router.get('/categories', getCategories);

module.exports = router;
