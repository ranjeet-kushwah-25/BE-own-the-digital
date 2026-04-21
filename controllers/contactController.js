const Contact = require('../models/Contact');
const { sendContactEmail, sendAutoReplyEmail } = require('../utils/email');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const contactData = {
      ...req.body,
      status: 'pending',
      emailSent: false
    };

    const contact = await Contact.create(contactData);

    // Send email notification
    const emailSent = await sendContactEmail(contact);
    const autoReplySent = await sendAutoReplyEmail(contact);

    // Update contact record with email status
    await Contact.findByIdAndUpdate(contact._id, {
      emailSent: emailSent && autoReplySent
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      data: {
        contact: {
          ...contact.toObject(),
          emailSent: emailSent && autoReplySent
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
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
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

// @desc    Update contact submission status
// @route   PUT /api/contact/:id
// @access  Private (admin only)
const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Contact submission updated successfully',
      data: {
        contact: updatedContact
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

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await Contact.findByIdAndDelete(id);

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
    const stats = await Promise.all([
      Contact.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ status: 'in-progress' }),
      Contact.countDocuments({ status: 'completed' }),
      Contact.countDocuments({ priority: 'high' }),
      Contact.countDocuments({ priority: 'medium' }),
      Contact.countDocuments({ priority: 'low' }),
      Contact.countDocuments({ emailSent: true }),
      Contact.countDocuments({ emailSent: false })
    ]);

    const [pending, inProgress, completed, highPriority, mediumPriority, lowPriority, emailSent, emailNotSent] = stats;

    // Get last 30 days submissions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSubmissions = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        status: {
          pending,
          inProgress,
          completed
        },
        priority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority
        },
        email: {
          sent: emailSent,
          notSent: emailNotSent
        },
        recent: {
          last30Days: recentSubmissions
        },
        total: pending + inProgress + completed
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
  updateContact,
  deleteContact,
  getContactStats,
};
