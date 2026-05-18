const mongoose = require('mongoose');

const userCertificateSchema = new mongoose.Schema({
  certificate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  issued_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issue_date: {
    type: Date,
    default: Date.now
  },
  expiry_date: {
    type: Date,
    default: null
  },
  certificate_number: {
    type: String,
    unique: true,
    sparse: true
  },
  verification_code: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  download_count: {
    type: Number,
    min: 0,
    default: 0
  },
  last_downloaded_at: Date,
  template_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  grade_achieved: {
    type: String,
    trim: true
  },
  completion_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
userCertificateSchema.index({ certificate_id: 1 });
userCertificateSchema.index({ user_id: 1 });
userCertificateSchema.index({ course_id: 1 });
userCertificateSchema.index({ issued_by: 1 });
userCertificateSchema.index({ issue_date: -1 });
userCertificateSchema.index({ status: 1 });
userCertificateSchema.index({ certificate_number: 1 });
userCertificateSchema.index({ verification_code: 1 });

// Compound index to prevent duplicate certificates for the same user/course
userCertificateSchema.index({
  certificate_id: 1,
  user_id: 1,
  course_id: 1
}, { unique: true });

// Update the updated_at field before saving
userCertificateSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Generate certificate number before saving
userCertificateSchema.pre('save', function(next) {
  if (!this.certificate_number) {
    this.certificate_number = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  if (!this.verification_code) {
    this.verification_code = `VC-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('UserCertificate', userCertificateSchema);
