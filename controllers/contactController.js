const Contact = require('../models/Contact');
const { sendContactEmail, sendAutoReplyEmail } = require('../utils/email');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {

    const { name, email, message } = req.body;

    const contactData = {
      name,
      email,
      message
    };

    const contact = await Contact.create(contactData);

    // Send email notification with proper error handling
    let emailSent = false;
    let autoReplySent = false;

    try {
      emailSent = await sendContactEmail(contact, email);
    } catch (error) {
      console.error('Contact email failed:', error);
    }

    try {
      autoReplySent = await sendAutoReplyEmail(contact);
    } catch (error) {
      console.error('Auto-reply email failed:', error);
    }

    const responseMessage = emailSent && autoReplySent
      ? 'Contact form submitted successfully. We will get back to you soon!'
      : 'Contact form submitted successfully. We will get back to you soon! (Email notifications may be delayed)';

    res.status(201).json({
      success: true,
      message: responseMessage,
      data: {
        contact,
        emailStatus: {
          notificationSent: emailSent,
          autoReplySent: autoReplySent
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions (admin only)
// @route   GET /api/contact
// @access  Private (admin only)
const getContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.substring(1) : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort.createdAt = -1; // Default sort by newest first
    }

    const contacts = await Contact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact submission by ID
// @route   GET /api/contact/:id
// @access  Private (admin only)
const getContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        contact
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete contact submission
// @route   DELETE /api/contact/:id
// @access  Private (admin only)
const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private (admin only)
const getContactStats = async (req, res, next) => {
  try {
    // Get last 30 days submissions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      })
    ]);

    const [total, recentSubmissions] = stats;

    res.status(200).json({
      success: true,
      data: {
        recent: {
          last30Days: recentSubmissions
        },
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts,
  getContact,
  deleteContact,
  getContactStats,
};
