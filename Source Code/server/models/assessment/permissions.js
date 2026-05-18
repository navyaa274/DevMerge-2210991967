const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  display_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  resource: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  scope: {
    type: String,
    enum: ['global', 'course', 'department', 'user', 'system'],
    default: 'global'
  },
  category: {
    type: String,
    enum: ['user_management', 'course_management', 'assessment', 'communication', 'analytics', 'system'],
    required: true
  },
  is_system_permission: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes
permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ category: 1 });
permissionSchema.index({ scope: 1 });
permissionSchema.index({ is_active: 1 });

// Update the updated_at field before saving
permissionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);
