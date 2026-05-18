const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  roomId: { type: String, required: true, unique: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  output: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collaboration', collaborationSchema);
