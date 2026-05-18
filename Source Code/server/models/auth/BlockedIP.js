const mongoose = require('mongoose');

const blockedIpSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Blocked', 'Flagged'], default: 'Blocked' },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlockedIP', blockedIpSchema);
