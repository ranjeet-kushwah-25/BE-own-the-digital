const mongoose = require('mongoose');
const Blog = require('../models/Blog');

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user.id
    };

    const blog = await Blog.create(blogData);

    // Populate author details
    await blog.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blog posts (with pagination and filtering)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = 'published'; // Default to published posts for public access
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.author) {
      filter.author = req.query.author;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
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

    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        blogs,
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

// @desc    Get single blog post by ID or slug
// @route   GET /api/blogs/:id
// @access  Public
const getBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    let blog;
    
    // Try to find by ID first, then by slug
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id).populate('author', 'name email');
    }
    
    if (!blog) {
      blog = await Blog.findOne({ slug: id }).populate('author', 'name email');
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (author or admin)
const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog post'
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: {
        blog: updatedBlog
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (author or admin)
const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog post'
      });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike blog post
// @route   POST /api/blogs/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const userId = req.user.id;
    const isLiked = blog.likes.includes(userId);

    if (isLiked) {
      // Unlike
      blog.likes.pull(userId);
    } else {
      // Like
      blog.likes.push(userId);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Blog post unliked' : 'Blog post liked',
      data: {
        likes: blog.likes.length,
        isLiked: !isLiked
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to blog post
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const comment = {
      user: req.user.id,
      content,
      createdAt: new Date()
    };

    blog.comments.push(comment);
    await blog.save();

    // Populate the new comment
    await blog.populate('comments.user', 'name email');

    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: newComment
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blog categories
// @route   GET /api/blogs/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  getCategories,
};
