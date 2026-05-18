const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  permission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  },
  scope_conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  granted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  granted_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  },
  expires_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });
rolePermissionSchema.index({ role_id: 1, is_active: 1 });
rolePermissionSchema.index({ permission_id: 1 });
rolePermissionSchema.index({ expires_at: 1 });

// Update the updated_at field before saving
rolePermissionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
