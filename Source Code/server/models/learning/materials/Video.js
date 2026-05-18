const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  url: { type: String, required: true }, // YouTube, Vimeo, or direct video URL
  duration: { type: Number, required: true }, // in seconds
  thumbnail: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  learningPath: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningPath' },
  module: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  watchedBy: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, default: 0 }, // percentage watched
    lastWatchedAt: Date,
    completed: { type: Boolean, default: false }
  }],
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
