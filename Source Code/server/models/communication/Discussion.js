const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'problem', 'course', 'exam', 'announcement'],
    default: 'general'
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  tags: [String],
  replies: [{
    authorId: mongoose.Schema.Types.ObjectId,
    content: String,
    likes: Number,
    createdAt: Date
  }],
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Discussion', discussionSchema);
