const express = require('express');
const router = express.Router();

const {
  submitContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  getContactStats,
} = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');
const { contactValidation } = require('../validators/contactValidator');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - subject
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the contact submission
 *         name:
 *           type: string
 *           description: Contact person's name
 *         email:
 *           type: string
 *           format: email
 *           description: Contact person's email
 *         subject:
 *           type: string
 *           description: Message subject
 *         message:
 *           type: string
 *           description: Message content
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         company:
 *           type: string
 *           description: Contact person's company
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           description: Contact submission status
 *         emailSent:
 *           type: boolean
 *           description: Whether email notification was sent
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Contact priority level
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when contact was submitted
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when contact was last updated
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               subject:
 *                 type: string
 *                 example: Project Inquiry
 *               message:
 *                 type: string
 *                 example: I would like to discuss a project with you...
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               company:
 *                 type: string
 *                 example: Acme Corp
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
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
 *                     contact:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 */
router.post('/', contactValidation, handleValidationErrors, submitContact);

/**
 * @swagger
 * /api/contact:
 *   get:
 *     summary: Get all contact submissions (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of contacts per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, and subject
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: Contact submissions retrieved successfully
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
 *                     contacts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Contact'
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticate, authorize('admin'), getContacts);

/**
 * @swagger
 * /api/contact/{id}:
 *   get:
 *     summary: Get single contact submission (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact submission ID
 *     responses:
 *       200:
 *         description: Contact submission retrieved successfully
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
 *                     contact:
 *                       $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Contact submission not found
 */
router.get('/:id', authenticate, authorize('admin'), getContact);

/**
 * @swagger
 * /api/contact/{id}:
 *   put:
 *     summary: Update contact submission status (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: in-progress
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *     responses:
 *       200:
 *         description: Contact submission updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Contact submission not found
 */
router.put('/:id', authenticate, authorize('admin'), updateContact);

/**
 * @swagger
 * /api/contact/{id}:
 *   delete:
 *     summary: Delete contact submission (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact submission ID
 *     responses:
 *       200:
 *         description: Contact submission deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Contact submission not found
 */
router.delete('/:id', authenticate, authorize('admin'), deleteContact);

/**
 * @swagger
 * /api/contact/stats:
 *   get:
 *     summary: Get contact statistics (admin only)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contact statistics retrieved successfully
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
 *                     status:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         in-progress:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                     priority:
 *                       type: object
 *                       properties:
 *                         high:
 *                           type: integer
 *                         medium:
 *                           type: integer
 *                         low:
 *                           type: integer
 *                     email:
 *                       type: object
 *                       properties:
 *                         sent:
 *                           type: integer
 *                         notSent:
 *                           type: integer
 *                     recent:
 *                       type: object
 *                       properties:
 *                         last30Days:
 *                           type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticate, authorize('admin'), getContactStats);

module.exports = router;
