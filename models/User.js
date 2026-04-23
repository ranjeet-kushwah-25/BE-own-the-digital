const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }],
  passwordResetToken: {
    token: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add refresh token method
userSchema.methods.addRefreshToken = function (token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

  this.refreshTokens.push({
    token,
    createdAt: new Date(),
    expiresAt
  });

  // Remove expired tokens
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > new Date());

  // Keep only last 5 refresh tokens
  this.refreshTokens = this.refreshTokens.slice(-5);

  return this.save();
};

// Remove refresh token method
userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

// Clear all refresh tokens method
userSchema.methods.clearRefreshTokens = function () {
  this.refreshTokens = [];
  return this.save();
};

// Check if refresh token exists
userSchema.methods.hasRefreshToken = function (token) {
  return this.refreshTokens.some(rt => rt.token === token && rt.expiresAt > new Date());
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to passwordResetToken field
  this.passwordResetToken.token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (15 minutes)
  this.passwordResetToken.expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return resetToken; // Return unhashed token for email
};

// Check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function (token) {
  if (!this.passwordResetToken.token || !this.passwordResetToken.expiresAt) {
    return false;
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return this.passwordResetToken.token === hashedToken && this.passwordResetToken.expiresAt > new Date();
};

// Clear password reset token
userSchema.methods.clearPasswordResetToken = function () {
  this.passwordResetToken.token = null;
  this.passwordResetToken.expiresAt = null;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
