const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    target: { type: String, enum: ['all', 'students', 'faculty'], default: 'all' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

// TTL index to automatically remove old broadcasts (7 days default)
broadcastSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
