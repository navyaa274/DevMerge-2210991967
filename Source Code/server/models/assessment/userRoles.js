const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  scope_conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  },
  expires_at: Date,
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries and ensure unique active user-role combinations
userRoleSchema.index({ user_id: 1, role_id: 1, is_active: 1 });
userRoleSchema.index({ user_id: 1, is_active: 1 });
userRoleSchema.index({ role_id: 1 });
userRoleSchema.index({ assigned_by: 1 });
userRoleSchema.index({ expires_at: 1 });

// Prevent duplicate active user-role assignments
userRoleSchema.pre('save', async function(next) {
  if (this.is_active) {
    const existingActive = await mongoose.model('UserRole').findOne({
      user_id: this.user_id,
      role_id: this.role_id,
      is_active: true,
      _id: { $ne: this._id }
    });

    if (existingActive) {
      return next(new Error('User already has this active role'));
    }
  }

  next();
});

// Update the updated_at field before saving
userRoleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('UserRole', userRoleSchema);
