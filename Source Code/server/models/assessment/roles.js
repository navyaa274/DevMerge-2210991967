const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  display_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 1
  },
  is_system_role: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    trim: true,
    maxlength: 7, // Hex color code
    default: '#6B7280'
  },
  icon: {
    type: String,
    trim: true,
    maxlength: 50
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
roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ level: 1 });
roleSchema.index({ is_active: 1 });

// Update the updated_at field before saving
roleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Role', roleSchema);
