const mongoose = require('mongoose');

const announcementReadSchema = new mongoose.Schema({
  announcement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseAnnouncement',
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
  read_at: {
    type: Date,
    default: Date.now
  },
  is_read: {
    type: Boolean,
    default: true
  },
  read_duration_seconds: {
    type: Number,
    default: 0
  },
  device_info: {
    type: String,
    trim: true
  },
  ip_address: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to ensure one read record per user per announcement
announcementReadSchema.index({ announcement_id: 1, user_id: 1 }, { unique: true });
announcementReadSchema.index({ user_id: 1, read_at: -1 });
announcementReadSchema.index({ course_id: 1, user_id: 1, read_at: -1 });

// Prevent duplicate read records
announcementReadSchema.pre('save', async function(next) {
  const existingRead = await mongoose.model('AnnouncementRead').findOne({
    announcement_id: this.announcement_id,
    user_id: this.user_id
  });

  if (existingRead) {
    return next(new Error('User has already read this announcement'));
  }

  next();
});

module.exports = mongoose.model('AnnouncementRead', announcementReadSchema);
