const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  introduction: {
    type: String,
    required: [true, 'Introduction is required'],
    maxlength: [1000, 'Introduction cannot exceed 1000 characters']
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  sections: [{
    section_number: {
      type: Number,
      required: true
    },
    section_title: {
      type: String,
      required: true,
      trim: true
    },
    section_content: {
      why_it_works: {
        type: String,
        required: true
      },
      how_to_implement: [{
        type: String,
        required: true
      }]
    }
  }],
  conclusion: {
    type: String,
    maxlength: [1000, 'Conclusion cannot exceed 1000 characters']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  // Enhanced date formatting for UI
  formattedDate: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true,
    enum: ['digital marketing', 'seo', 'social media marketing', 'content marketing', 'email marketing', 'ppc', 'influencer marketing', 'video marketing']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  heroImage: {
    type: String,
    default: null
  },
  thumbnailImage: {
    type: String,
    default: null
  },
  readTime: {
    type: Number,
    default: 0
  },
  readTimeText: {
    type: String,
    default: '0 min read'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedBlogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
}, {
  timestamps: true
});

// Create slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();
  }
  next();
});

// Auto-format date for UI display
blogSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('createdAt')) {
    const date = new Date(this.createdAt);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    // Add ordinal suffix to day (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinalSuffix = (num) => {
      const j = num % 10;
      const k = Math.floor(num / 10);
      if (k === 1) return 'th';
      return j === 1 ? 'st' : j === 2 ? 'nd' : j === 3 ? 'rd' : 'th';
    };

    this.formattedDate = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
  }
  next();
});

// Calculate read time based on all content fields
blogSchema.pre('save', function(next) {
  if (this.isModified('introduction') || this.isModified('summary') || this.isModified('sections') || this.isModified('conclusion')) {
    const wordsPerMinute = 200;
    let totalWords = 0;

    // Count words from introduction
    if (this.introduction) {
      totalWords += this.introduction.split(/\s+/).length;
    }

    // Count words from summary
    if (this.summary) {
      totalWords += this.summary.split(/\s+/).length;
    }

    // Count words from sections
    if (this.sections && this.sections.length > 0) {
      this.sections.forEach(section => {
        if (section.section_title) {
          totalWords += section.section_title.split(/\s+/).length;
        }
        if (section.section_content && section.section_content.why_it_works) {
          totalWords += section.section_content.why_it_works.split(/\s+/).length;
        }
        if (section.section_content && section.section_content.how_to_implement) {
          section.section_content.how_to_implement.forEach(item => {
            totalWords += item.split(/\s+/).length;
          });
        }
      });
    }

    // Count words from conclusion
    if (this.conclusion) {
      totalWords += this.conclusion.split(/\s+/).length;
    }

    this.readTime = Math.ceil(totalWords / wordsPerMinute);
    this.readTimeText = `${this.readTime} min read`;
  }
  next();
});

// Index for better search performance
blogSchema.index({
  title: 'text',
  introduction: 'text',
  summary: 'text',
  'sections.section_title': 'text',
  'sections.section_content.why_it_works': 'text',
  'sections.section_content.how_to_implement': 'text',
  conclusion: 'text'
});
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model('Blog', blogSchema);
